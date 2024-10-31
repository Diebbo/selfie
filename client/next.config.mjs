/** @type {import('next').NextConfig} */
// next.config.js
const nextConfig = {
  reactStrictMode: false,
  distDir: "nextbuild",
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: "http://localhost:8000/api/:slug*",
      },
    ];
  },
};

export default nextConfig;
