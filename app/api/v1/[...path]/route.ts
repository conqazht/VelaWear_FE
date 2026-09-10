import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_API_URL = "http://localhost:8080/api/v1";

function getBackendApiUrl(): string {
  const url =
    process.env.BACKEND_API_URL ||
    (process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_API_URL
      : undefined) ||
    DEFAULT_BACKEND_API_URL;
  return url.replace(/\/+$/, "");
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const backendBaseUrl = getBackendApiUrl();
  const subPath = path.join("/");
  const targetUrl = new URL(`${backendBaseUrl}/${subPath}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    // Exclude hop-by-hop headers
    if (["host", "connection", "content-length"].includes(key.toLowerCase())) {
      continue;
    }
    headers.set(key, value);
  }

  // Explicitly ensure client cookies are forwarded upstream
  const clientCookies = request.headers.get("cookie") || request.cookies.toString();
  if (clientCookies) {
    headers.set("cookie", clientCookies);
  }

  // Forward client IP if available
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
  }

  let body: ArrayBuffer | undefined = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) {
      body = buffer;
    }
  }

  let response: Response;
  try {
    response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 502,
        message: "Bad Gateway: Failed to reach backend service",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });

  // Extract all Set-Cookie headers from backend response
  const rawCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie")!]
        : [];

  const isHttps =
    request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  for (const cookieStr of rawCookies) {
    const parsed = parseSetCookie(cookieStr);
    if (parsed) {
      if (isHttps) {
        parsed.secure = true;
      }
      // Ensure path covers all BFF proxy endpoints
      if (!parsed.path || parsed.path.startsWith("/api/v1")) {
        parsed.path = "/api/v1";
      }
      nextResponse.cookies.set(parsed);
    } else {
      let formattedCookie = cookieStr;
      // Ensure Secure attribute if on HTTPS
      if (isHttps && !formattedCookie.toLowerCase().includes("; secure")) {
        formattedCookie += "; Secure";
      }
      nextResponse.headers.append("set-cookie", formattedCookie);
    }
  }

  return nextResponse;
}

function parseSetCookie(cookieStr: string) {
  const parts = cookieStr.split(";").map((p) => p.trim());
  const [firstPart, ...attributes] = parts;
  const equalIdx = firstPart.indexOf("=");
  if (equalIdx === -1) return null;
  const name = firstPart.slice(0, equalIdx).trim();
  const value = firstPart.slice(equalIdx + 1).trim();

  const options: {
    name: string;
    value: string;
    path?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
  } = { name, value };

  for (const attr of attributes) {
    const [attrKey, ...attrVals] = attr.split("=");
    const key = attrKey.trim().toLowerCase();
    const val = attrVals.join("=").trim();

    if (key === "path") {
      options.path = val;
    } else if (key === "max-age") {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) options.maxAge = parsed;
    } else if (key === "expires") {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) options.expires = parsed;
    } else if (key === "httponly") {
      options.httpOnly = true;
    } else if (key === "secure") {
      options.secure = true;
    } else if (key === "samesite") {
      const lower = val.toLowerCase();
      if (lower === "lax" || lower === "strict" || lower === "none") {
        options.sameSite = lower;
      }
    }
  }

  return options;
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
export const HEAD = handleProxy;
