/** @type {import('next').NextConfig} */
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  distDir: "nextbuild",
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
