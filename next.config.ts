import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Avoid wrong tracing root when a lockfile exists in a parent folder (e.g. user home)
  outputFileTracingRoot: path.join(__dirname),
  output: 'standalone',
};

export default nextConfig;
