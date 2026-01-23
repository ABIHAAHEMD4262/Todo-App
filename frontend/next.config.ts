import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Compiler for better performance
  reactCompiler: true,

  // Enable standalone output for Docker optimization
  // This creates a minimal server bundle in .next/standalone
  // Reduces Docker image size by ~70% (from ~500MB to ~150MB)
  output: 'standalone',
};

export default nextConfig;
