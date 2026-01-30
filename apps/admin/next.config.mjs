/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.APP_STORAGE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.APP_STORAGE_SUPABASE_KEY,
    NEXT_PUBLIC_SUPABASE_BUCKET:
      process.env.NEXT_PUBLIC_SUPABASE_BUCKET ||
      process.env.APP_STORAGE_SUPABASE_BUCKET ||
      "room-images"
  }
};

export default nextConfig;
