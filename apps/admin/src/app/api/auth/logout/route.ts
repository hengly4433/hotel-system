import { NextResponse } from "next/server";

const COOKIE = process.env.AUTH_COOKIE_NAME || "hotel_access_token";
const SECURE = (process.env.AUTH_COOKIE_SECURE || "false") === "true";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: COOKIE,
    value: "",
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
