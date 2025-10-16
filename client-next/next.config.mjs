/** @type {import('next').NextConfig} */
const nextConfig = {
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