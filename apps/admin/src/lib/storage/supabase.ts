const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "room-images";

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase storage is not configured.");
  }
}

export function buildSupabaseObjectPath(folder: string, filename: string) {
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/-+/g, "-");
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${safeFolder}/${Date.now()}-${safeName}`;
}

export function buildSupabasePublicUrl(path: string) {
  assertConfigured();
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

export async function uploadSupabaseFile(file: File, path: string) {
  assertConfigured();
  const url = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: file
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  return buildSupabasePublicUrl(path);
}
