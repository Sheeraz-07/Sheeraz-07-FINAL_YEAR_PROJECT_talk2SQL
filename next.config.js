/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
