# Cloudflare Pages static build

This branch adds a standalone static web target for Cloudflare Pages. It is intentionally separate from the WXT browser extension build, because the extension uses browser APIs that do not exist on a hosted static site.

## Local build

```bash
pnpm run build:cloudflare
```

The static output is written to:

```text
dist-cloudflare
```

## Cloudflare Pages settings

- Framework preset: `Vite`
- Build command: `pnpm run build:cloudflare`
- Build output directory: `dist-cloudflare`
- Node.js version: use the project default supported by Cloudflare, or set `NODE_VERSION` to a current LTS version if your account requires it.

## Optional account sync

The static build can enable email magic-link login and cross-device sync through Supabase Auth.

1. Create a Supabase project.
2. Run [cloudflare-sync-schema.sql](./cloudflare-sync-schema.sql) in the Supabase SQL editor.
3. Add these Cloudflare Pages environment variables:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these variables, the page stays local-only and does not show a broken login flow.

The regular extension build remains unchanged:

```bash
pnpm run build
```
