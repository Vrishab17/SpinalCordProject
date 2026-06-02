import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/assessment/new",
        destination: "/assessment",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
