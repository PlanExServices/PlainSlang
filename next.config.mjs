/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
