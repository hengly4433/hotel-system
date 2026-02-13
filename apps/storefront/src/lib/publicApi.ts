export async function publicApi<T>(path: string) {
  let base = process.env.BACKEND_BASE_URL || "http://localhost:8080";
  if (base.startsWith("http://") || base.startsWith("https://")) {
    // Already a full URL, use as-is
  } else if (!base.includes(".")) {
    base = `https://${base}.onrender.com`;
  } else {
    base = `https://${base}`;
  }
  const prefix = process.env.BACKEND_API_PREFIX || "/api/v1";

  const url = `${base}${prefix}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}
