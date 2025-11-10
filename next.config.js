/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to allow API routes to work
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
