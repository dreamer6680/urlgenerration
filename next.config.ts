import type { NextConfig } from "next";

require('dotenv').config();

const nextConfig: NextConfig = {
  // 开发环境允许的跨域请求源
  env: {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  }
};

export default nextConfig;
