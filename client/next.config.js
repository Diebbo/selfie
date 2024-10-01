/** @type {import('next').NextConfig} */
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: 'http://localhost:3001/api/:slug*',
      },
    ];
  },
}

export default nextConfig;
