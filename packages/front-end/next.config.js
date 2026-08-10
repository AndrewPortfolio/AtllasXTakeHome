/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `shared` ships TypeScript source rather than a build artifact, so Next has to compile it.
  transpilePackages: ['shared'],
}

module.exports = nextConfig
