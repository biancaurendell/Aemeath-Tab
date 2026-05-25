# Account sync research notes

## Mature patterns reviewed

- xBrowserSync: treats sync as a device-aware data envelope with conflict handling and a self-hostable service boundary.
- Floccus: keeps browser data portable by separating client adapters from remote storage providers.
- Supabase Auth examples: email magic-link login is low-friction for static apps, and Row Level Security keeps each user's sync document isolated.
- Cloudflare Pages guidance: static apps should keep secrets out of the client and use public anon keys only with backend-enforced access rules.

## Direction for this project

The existing extension already has a solid `browser.storage.sync` path with device IDs, versions, and conflict resolution. Cloudflare Pages cannot use that browser API, so the static build now uses a separate Supabase-backed account sync document:

- `newtab_sync.user_id` is the account boundary.
- `device_id` and `device_name` identify the last writer.
- `version` is a monotonic counter for future stricter conflict checks.
- `payload` stores the current static-page snapshot.

This gives the hosted web version true cross-device sync while keeping the extension build unchanged.

## Current synced payload

- Search engine selection.
- Daily board focus, note, tasks, collapse state, and timer mode.

Timer running state is intentionally not synced; every device resumes with the timer paused.

## Next integration step

To unify extension and hosted web sync, move the shared sync envelope into a provider abstraction:

- `ExtensionSyncProvider`: existing `browser.storage.sync`.
- `SupabaseSyncProvider`: account-based remote document.

Once both providers read and write the same envelope, settings, shortcuts, custom search engines, and daily board data can sync across browser extension and Cloudflare web deployments under one account.
