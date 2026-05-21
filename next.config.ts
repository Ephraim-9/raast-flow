import type { NextConfig } from "next";
import path from "node:path";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.34.212.168"],
  outputFileTracingRoot: path.resolve(__dirname),
};

export default withPWA(nextConfig);
