/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  reactStrictMode: true,
  async redirects() {
    // GSC 404 fixes — legacy URLs 301 to their canonical destinations.
    // Next.js first 308-normalizes a trailing slash (/home/ → /home), so each
    // rule must match BOTH the slash and non-slash source to catch every variant.
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/home/', destination: '/', permanent: true },
      { source: '/thank-you-contact-us', destination: '/', permanent: true },
      { source: '/thank-you-contact-us/', destination: '/', permanent: true },
      { source: '/flat-roofs', destination: '/services/flat-roofing', permanent: true },
      { source: '/flat-roofs/', destination: '/services/flat-roofing', permanent: true },
    ];
  },
};

module.exports = nextConfig;
