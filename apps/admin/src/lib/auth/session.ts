import { cookies } from "next/headers";

const COOKIE = process.env.AUTH_COOKIE_NAME || "hotel_access_token";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE)?.value || null;
}
