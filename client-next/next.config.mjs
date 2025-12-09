/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Allow images from backend and external sources
  images: {
    domains: [
      'localhost',
      'www.healthywomen.org',
      'www.health.com',
      'guardian.ng',
      'www.bbc.com',
    ],
  },
};

export default nextConfig;