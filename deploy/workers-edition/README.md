# Workers edition configs

`wrangler.jsonc` and `open-next.config.ts` live at the REPO ROOT because the
active Cloudflare Workers (git-integrated) deployment needs them there, with
build command: npx opennextjs-cloudflare build
deploy command: npx wrangler deploy

The copies in this folder are backups. The static read-only fallback means the
Worker serves the bundled site/data.json when no Supabase env vars are set.
