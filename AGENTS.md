# AGENTS.md

Repository instructions for AI coding agents working on Aemeath's Tab.

## Project Identity

Aemeath's Tab is a personal fork and second-stage development project based on
[Redlnn/lemon-new-tab](https://github.com/Redlnn/lemon-new-tab). It is not an
official Lemon New Tab release.

Keep the upstream credit and license notes intact when editing public
documentation. The local `LICENSE` file is the current source of truth for this
repo, but upstream currently states that Lemon New Tab is AGPL-3.0 from v3.2.3
onward and was MIT before that. Before publishing or syncing more upstream code,
verify the actual upstream base version and update this repo's license files if
needed.

Upstream also excludes trademark-related assets from its open-source license.
Treat third-party brand assets and newly added personal assets with the same
care.

## Current Architecture

- Browser extension target: WXT + Vue 3 + TypeScript + Element Plus.
- Simple web deployment target: Cloudflare Pages build under `web/cloudflare`.
- Production `aemeath.love` deployment target: Cloudflare Workers Assets via
  `wrangler.jsonc`, serving the extension-like WXT output prepared under
  `dist-cloudflare-worker`.
- Background service worker: `entrypoints/background/index.ts`.
- New-tab startup: `entrypoints/newtab/init.ts`, then `entrypoints/newtab/main.ts`.
- Main new-tab UI: `entrypoints/newtab/App.vue`.
- Settings domain: `shared/settings`.
- Sync domain: `shared/sync`.
- Theme domain: `shared/theme`.
- Runtime i18n: `shared/i18n.ts`; language resources live in `locales`.
- Aemeath-specific visual and interaction layer:
  `entrypoints/newtab/components/AemeathLayer.vue`,
  `entrypoints/newtab/styles/aemeath.scss`, and `public/aemeath`.

Do not reintroduce the old pre-refactor implementation or legacy compatibility
paths unless the user explicitly asks for an archival recovery task.

## Package Manager And Scripts

Use Node.js 24+ and pnpm for project commands.

- Install: `pnpm install`
- Dev Chrome: `pnpm dev`
- Dev Firefox: `pnpm run dev:firefox`
- Dev Edge: `pnpm run dev:edge`
- Type check: `pnpm run type-check`
- Full lint: `pnpm run lint`
- Build Chrome extension: `pnpm run build`
- Build Firefox extension: `pnpm run build:firefox`
- Build Edge extension: `pnpm run build:edge`
- Build Cloudflare web target: `pnpm run build:cloudflare`
- Patch Cloudflare Workers Assets output: `pnpm run patch:cloudflare-worker`
- Zip Chrome/Firefox/Edge: `pnpm run zip`, `pnpm run zip:firefox`,
  `pnpm run zip:edge`
- Format: `pnpm run format`

When verifying a change, choose the smallest command that proves the touched
surface. For shared settings, sync, WXT config, or entrypoint changes, prefer at
least `pnpm run build`.

## Development Rules

- Keep changes small and focused. Do not mix unrelated cleanup, feature work,
  and generated assets in the same commit.
- Commit after each stable feature point or cleanup point.
- Preserve existing WXT, Vue, Pinia, Element Plus, and local helper patterns.
- Use Vue SFC `script setup` with TypeScript for UI components.
- Use `@/` and `@newtab/` aliases consistently where the codebase already does.
- Respect the existing lint stack: `eslint.config.ts` and
  `stylelint.config.ts`.
- Do not manually edit generated declaration files:
  `types/auto-imports.d.ts` and `types/components.d.ts`.
- Keep Aemeath customization isolated in the Aemeath layer, Aemeath styles, and
  Aemeath assets unless a shared feature genuinely needs to change.
- Keep Cloudflare web code as a separate build target, not as a replacement for
  extension code.
- Do not commit build output from `.output`, `dist-cloudflare`, or
  `dist-cloudflare-worker`.
- Do not stage unrelated local folders such as `.claude/` or unreviewed asset
  drops unless the user explicitly asks.

## Cloudflare Workers Deployment Notes

The `aemeath.love` deployment uses the Worker named `imiss` with Workers Assets,
not the simplified `web/cloudflare` page. For this target, deploy from
`dist-cloudflare-worker` using `wrangler.jsonc`.

- Keep `wrangler.jsonc` pointed at `./dist-cloudflare-worker` with
  `not_found_handling: "single-page-application"`.
- Do not include `_redirects` in `dist-cloudflare-worker`; Workers Assets rejects
  the old SPA redirect rule as an infinite loop.
- The default wallpaper must exist at
  `aemeath/wallpapers/default-config.png`. Also run
  `pnpm run patch:cloudflare-worker` before deployment so the compatibility
  alias `aemeath_wallpapers_default-config.png` is present.
- If the deployed page loads music but loses the wallpaper, first check the two
  wallpaper URLs directly before changing UI code:
  `/aemeath/wallpapers/default-config.png` and
  `/aemeath_wallpapers_default-config.png`.
- If both URLs work but the page is still blank or wallpaperless, suspect stale
  web-shim `localStorage` settings before changing source code.

## Data And Compatibility

This repo no longer maintains compatibility with the original or older local
storage schemas. Current settings and sync code should target the current schema
only. If old data recovery is needed, do it as an explicit one-off migration
task and keep that code out of the main runtime path afterward.

Settings and sync remain high-risk areas:

- If settings structure changes, update `shared/settings/current.ts` and
  `shared/settings/default.ts` together.
- New settings with safe defaults do not automatically require a config version
  bump; deleting or renaming persisted fields does.
- Keep `shared/settings/bootstrap.ts` stable because it guards startup.
- Background sync intentionally keeps the latest snapshot in
  `entrypoints/background/index.ts`; avoid broad rewrites there without a build
  and focused review.

## i18n Rules

- Keep namespaces aligned with `shared/i18n.ts`: `newtab`, `settings`, `sync`,
  and `faq`.
- When adding or renaming translation keys, update every language under
  `locales`.

## Browser Differences

- Browser-specific manifest and permission differences belong in
  `wxt.config.ts`.
- Do not scatter browser permission changes through UI code.

## UI Guidance

The product is a usable new-tab experience, not a landing page. Keep the first
screen functional and calm:

- Search, clock, shortcuts, dock, wallpaper, music, and Aemeath effects should
  remain ergonomic.
- Avoid marketing-style hero sections inside the extension UI.
- Keep controls discoverable and consistent with Element Plus and the existing
  settings layout.
- Verify responsive layout when touching visible UI.

## Git Hygiene

The main development branch is `main`. Historical branches/tags are archives,
not active development tracks.

Use small, descriptive commit messages. Upstream prefers gitmoji prefixes, but
this fork may use the current repo convention as long as each commit is focused.

Before finishing a task:

- Run `git status --short --branch`.
- Confirm only intended files are staged.
- Mention any verification command that was run.
