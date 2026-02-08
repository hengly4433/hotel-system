import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = process.env.AUTH_COOKIE_NAME || "hotel_access_token";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  let base = process.env.BACKEND_BASE_URL;
  if (base && !base.includes(".")) {
    base = `https://${base}.onrender.com`;
  } else if (base && !base.startsWith("http")) {
    base = `https://${base}`;
  }
  const prefix = process.env.BACKEND_API_PREFIX || "/api/v1";

  if (!base) {
    return NextResponse.json(
      { code: "CONFIG_ERROR", message: "BACKEND_BASE_URL is not set" },
      { status: 500 }
    );
  }

  const { path: pathParam } = await context.params;
  const path = pathParam?.join("/") ?? "";
  const url = `${base}${prefix}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const accept = req.headers.get("accept");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);

  const token = req.cookies.get(COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  let res;
  try {
    res = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: "no-store"
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { code: "PROXY_ERROR", message: "Failed to connect to backend", detail: String(error) },
      { status: 502 }
    );
  }

  const resBody = await res.arrayBuffer();
  const response = new NextResponse(resBody, { status: res.status });

  const resContentType = res.headers.get("content-type");
  if (resContentType) response.headers.set("content-type", resContentType);

  return response;
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
