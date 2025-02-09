/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  reactStrictMode: true, // Tetap aktifkan mode Strict React
};

module.exports = nextConfig;
