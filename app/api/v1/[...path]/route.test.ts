import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("BFF Proxy Route Handler (/api/v1/[...path])", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubEnv("BACKEND_API_URL", "http://localhost:8080/api/v1");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("chuyển tiếp GET request cùng query params và headers sang backend", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: [{ id: 1, name: "Shirt" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    global.fetch = mockFetch;

    const request = new NextRequest("http://localhost:3000/api/v1/products?page=1&size=10", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "vi",
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ["products"] }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data[0].name).toBe("Shirt");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("http://localhost:8080/api/v1/products?page=1&size=10");
    expect(calledOptions.method).toBe("GET");
    expect(calledOptions.headers.get("accept-language")).toBe("vi");
  });

  it("chuyển tiếp POST request cùng body và Cookie từ client sang backend", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, data: { accessToken: "fresh-token" } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie":
            "refresh_token=rotated-token; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=259200",
        },
      }),
    );
    global.fetch = mockFetch;

    const request = new NextRequest("http://localhost:3000/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "refresh_token=existing-cookie-token",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ["auth", "refresh"] }),
    });

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("http://localhost:8080/api/v1/auth/refresh");
    expect(calledOptions.headers.get("cookie")).toBe("refresh_token=existing-cookie-token");

    // Kiểm tra Set-Cookie được chuyển tiếp về client response
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("refresh_token=rotated-token");
    expect(setCookie).toContain("HttpOnly");
  });

  it("bổ sung Secure vào Set-Cookie khi chạy qua HTTPS", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200 }), {
        status: 200,
        headers: {
          "Set-Cookie": "refresh_token=token123; HttpOnly; SameSite=Lax; Path=/api/v1/auth",
        },
      }),
    );
    global.fetch = mockFetch;

    const request = new NextRequest("https://velawear-fe.vercel.app/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-Proto": "https",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ["auth", "login"] }),
    });

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("refresh_token=token123");
    expect(setCookie).toContain("; Secure");
  });

  it("trả về 502 Bad Gateway khi không thể kết nối tới backend", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Connection refused"));
    global.fetch = mockFetch;

    const request = new NextRequest("http://localhost:3000/api/v1/products", {
      method: "GET",
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ["products"] }),
    });

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.statusCode).toBe(502);
    expect(body.message).toContain("Bad Gateway");
  });
});
