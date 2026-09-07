// OpenNext adapter config for Cloudflare Workers.
// buildCommand is pinned to raw `next build` so that package.json's "build"
// script can safely be `opennextjs-cloudflare build` without infinite recursion
// (OpenNext runs THIS command, not `npm run build`).
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default {
  ...defineCloudflareConfig({}),
  buildCommand: 'npx next build',
};
