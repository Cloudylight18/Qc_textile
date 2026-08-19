import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mengizinkan domain ngrok agar resource dev (CSS/Font/HMR) tidak diblokir di HP
  allowedDevOrigins: [
    "showplace-subtract-vehicular.ngrok-free.dev",
  ],
};

export default nextConfig;