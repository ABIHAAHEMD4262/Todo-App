import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for better performance
  reactCompiler: true,

  // Turbopack configuration (used by default in Next.js 16+)
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
