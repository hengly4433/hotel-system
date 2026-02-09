import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  let base = process.env.BACKEND_BASE_URL || "http://localhost:8080";
  if (base && !base.includes(".")) {
    base = `https://${base}.onrender.com`;
  } else if (!base.startsWith("http")) {
    base = `https://${base}`;
  }
  console.log("DEBUG: Using BACKEND_BASE_URL:", base);
  const prefix = process.env.BACKEND_API_PREFIX || "/api/v1";

  const { path: pathParam } = await context.params;
  const path = pathParam?.join("/") ?? "";
  const url = `${base}${prefix}/public/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const accept = req.headers.get("accept");
  const authorization = req.headers.get("authorization");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (authorization) headers.set("authorization", authorization);

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual"
  });

  const resBody = await res.arrayBuffer();
  const response = new NextResponse(resBody, { status: res.status });

  const resContentType = res.headers.get("content-type");
  if (resContentType) response.headers.set("content-type", resContentType);
  const resLocation = res.headers.get("location");
  if (resLocation) response.headers.set("location", resLocation);
  const resSetCookie = res.headers.get("set-cookie");
  if (resSetCookie) response.headers.set("set-cookie", resSetCookie);

  return response;
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
