import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Solo para desarrollo local contra Supabase local (127.0.0.1). En
    // producción la URL de Supabase es pública (https://*.supabase.co) y
    // esta protección SSRF de Next.js no aplica.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
    ],
  },
};

export default nextConfig;
