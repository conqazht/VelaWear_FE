import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("@/lib/api-client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-client")>();
  const client = original.default;

  // Override post to spy while preserving the real Axios instance (transforms run)
  const originalPost = client.post.bind(client);
  client.post = postMock.mockImplementation((...args: Parameters<typeof originalPost>) =>
    originalPost(...args),
  );

  return { ...original, default: client };
});

import { createReview } from "@/lib/api/commerce";
import apiClient from "@/lib/api-client";

describe("createReview — transport-level", () => {
  let capturedConfig: InternalAxiosRequestConfig | null = null;
  let capturedData: unknown = null;

  const adapter: AxiosAdapter = async (config) => {
    capturedConfig = config;
    capturedData = config.data;
    return {
      config,
      data: {
        statusCode: 201,
        message: "Created",
        data: { id: 42 },
      },
      headers: {},
      status: 201,
      statusText: "Created",
    } satisfies AxiosResponse;
  };

  beforeEach(() => {
    capturedConfig = null;
    capturedData = null;
    apiClient.defaults.adapter = adapter;
  });

  afterEach(() => {
    delete apiClient.defaults.adapter;
    vi.restoreAllMocks();
  });

  it("multipart review với ảnh đến adapter dưới dạng FormData, không bị JSON serialize", async () => {
    const image = new File(["pixels"], "photo.webp", { type: "image/webp" });

    await createReview({
      orderItemId: 41,
      rating: 5,
      comment: "  Chất liệu đẹp.  ",
      images: [image],
    });

    // Data reaching the adapter must still be FormData — not a serialized string
    expect(capturedData).toBeInstanceOf(FormData);
    const fd = capturedData as FormData;

    // review JSON Blob present
    const reviewPart = fd.get("review");
    expect(reviewPart).toBeInstanceOf(Blob);
    const payload = JSON.parse(await (reviewPart as Blob).text());
    expect(payload).toEqual({
      orderItemId: 41,
      rating: 5,
      comment: "Chất liệu đẹp.",
    });
    expect(payload).not.toHaveProperty("userId");
    expect(payload).not.toHaveProperty("imageUrl");

    // Image file present
    expect(fd.getAll("images")).toHaveLength(1);
    expect(fd.getAll("images")[0]).toBeInstanceOf(File);

    // Content-Type must NOT be forced to application/json
    const contentType = capturedConfig?.headers?.["Content-Type"];
    expect(contentType).not.toBe("application/json");
  });

  it("multipart review không có ảnh vẫn gửi FormData", async () => {
    await createReview({
      orderItemId: 12,
      rating: 3,
      comment: undefined,
      images: [],
    });

    expect(capturedData).toBeInstanceOf(FormData);
    const fd = capturedData as FormData;
    expect(fd.get("review")).toBeInstanceOf(Blob);
    expect(fd.getAll("images")).toHaveLength(0);
  });

  it("plain JSON object request vẫn serialize thành JSON", async () => {
    await apiClient.post("/test/json", { name: "Vela", count: 7 });

    // A plain object should be serialized to a JSON string
    expect(typeof capturedData).toBe("string");
    const parsed = JSON.parse(capturedData as string);
    expect(parsed).toEqual({ name: "Vela", count: 7 });

    // Content-Type should be application/json for plain objects
    const contentType = capturedConfig?.headers?.["Content-Type"];
    expect(contentType).toContain("application/json");
  });
});
