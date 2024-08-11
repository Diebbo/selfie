/** @type {import('next').NextConfig} */
// next.config.js
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: 'http://localhost:3001/:slug*', // Proxy to Backend
      },
    ];
  },
};
