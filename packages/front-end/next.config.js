/** @type {import('next').NextConfig} */

// `next dev` blocks request from non localhost addresses
// allowing ip addresses allows mobile to work
const privateNetworkOrigins = [
  '10.*.*.*',
  '192.168.*.*',
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
];

const nextConfig = {
  reactStrictMode: true,

  // `shared` ships TypeScript source rather than a build artifact, so Next has to compile it.
  transpilePackages: ['shared'],

  // Development only; `next build` and `next start` ignore it.
  allowedDevOrigins: privateNetworkOrigins,
}

module.exports = nextConfig
