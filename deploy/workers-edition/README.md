# Workers edition (optional, dormant)

These configs were moved out of the repo root so Cloudflare Pages doesn't
auto-detect the project as a Workers/OpenNext app.

The PRIMARY deployment is the static edition: Cloudflare Pages serving `site/`
(no build command). See the main README.

To use the Workers+Supabase edition instead: copy `wrangler.jsonc` and
`open-next.config.ts` back to the repo root, restore the deploy script
(`opennextjs-cloudflare build && opennextjs-cloudflare deploy`), and follow
the README's "server editions" section.
