import { NextResponse } from "next/server";

const COOKIE = process.env.AUTH_COOKIE_NAME || "hotel_access_token";
const SECURE = (process.env.AUTH_COOKIE_SECURE || "false") === "true";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  let base = process.env.BACKEND_BASE_URL;
  // Only transform if it's not already a full URL
  if (base && !base.startsWith("http://") && !base.startsWith("https://")) {
    // If it doesn't include a dot, assume it's a Render.com service name
    if (!base.includes(".")) {
      base = `https://${base}.onrender.com`;
    } else {
      base = `https://${base}`;
    }
  }
  console.log("DEBUG: Using BACKEND_BASE_URL:", base);
  const prefix = process.env.BACKEND_API_PREFIX || "/api/v1";

  if (!base) {
    return NextResponse.json(
      { code: "CONFIG_ERROR", message: "BACKEND_BASE_URL is not set" },
      { status: 500 }
    );
  }

  const loginUrl = `${base}${prefix}/auth/login`;
  console.log("DEBUG: Attempting login to:", loginUrl);

  let res;
  try {
    res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store"
    });
  } catch (err) {
    console.error("DEBUG: Fetch error:", err);
    return NextResponse.json(
      { code: "CONNECTION_ERROR", message: `Failed to connect to backend: ${err}` },
      { status: 502 }
    );
  }

  const data = await res.json().catch(() => null);
  console.log("DEBUG: Backend response status:", res.status, "data:", data);

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
