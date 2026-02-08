import { NextResponse } from "next/server";

const COOKIE = process.env.AUTH_COOKIE_NAME || "hotel_access_token";
const SECURE = (process.env.AUTH_COOKIE_SECURE || "false") === "true";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  let base = process.env.BACKEND_BASE_URL;
  if (base && !base.startsWith("http")) {
    base = `https://${base}`;
  }
  console.log("DEBUG: Using BACKEND_BASE_URL:", base);
  const prefix = process.env.BACKEND_API_PREFIX || "/api/v1";

  if (!base) {
    return NextResponse.json(
      { code: "CONFIG_ERROR", message: "BACKEND_BASE_URL is not set" },
      { status: 500 }
    );
  }

  const res = await fetch(`${base}${prefix}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { code: data?.code || "LOGIN_FAILED", message: data?.message || "Login failed." },
      { status: res.status }
    );
  }

  const token = data.accessToken as string;
  const expiresInSeconds = Number(data.expiresInSeconds ?? 1800);

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds
  });

  return response;
}
