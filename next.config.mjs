/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  serverExternalPackages: ['pg'],
  // pg lazily requires its optional Workers adapter (pg-cloudflare); include it
  // in the output trace so the OpenNext/Cloudflare bundle can resolve it.
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/pg-cloudflare/**'],
  },
};

export default nextConfig;
