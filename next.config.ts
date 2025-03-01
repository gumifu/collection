/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xxx.supabase.co",
      },
    ],
  },
}

export default nextConfig
