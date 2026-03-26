/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vz-*.b-cdn.net', 'image.pollinations.ai'],
    remotePatterns: [
      { protocol: 'https', hostname: 'image.pollinations.ai' },
    ],
  },
};

module.exports = nextConfig;
