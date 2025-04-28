/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone', // 为Docker部署优化
  reactStrictMode: true,
}

module.exports = nextConfig;