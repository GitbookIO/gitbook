# Shiki assets — measurements

Commands (from `packages/gitbook`):
- Next: `bun run build:local && bun scripts/measure-shiki-bundles.ts next`
- Cold highlight: `bun scripts/bench-highlight-cold.ts 7` (fresh process per run, first highlight of javascript + python + vue; medians)
- Cloudflare: `bun run build:cloudflare && bun scripts/measure-shiki-bundles.ts cloudflare`
- Worker memory: wipe `openNext/customWorkers/.wrangler`, then
  `PROFILE_URL=http://127.0.0.1:8771/url/gitbook.com/docs/developers/gitbook-api/quickstart PROFILE_REQUESTS=3 PROFILE_FORCE_GC=true bun scripts/profile-opennext-memory.ts`
  (page with highlighted code; heap of the server worker after the first render and after 3 more)

| Metric | Baseline | Task 2 (server + client) | Task 3 | Task 4 |
|---|---|---|---|---|
| **Vercel / Node** | | | | |
| Page function trace, total | 20.01 MB (760 files) | 19.01 MB (756 files) | | |
| ↳ Shiki langs/themes in trace | 9.29 MB | 8.27 MB (JSON, 307 files) | | |
| Cold import of `highlight` (median) | 183 ms | 179 ms | | |
| Cold first highlight, 3 langs (median) | 195 ms | 188 ms | | |
| RSS after first highlight (median) | 207 MB | 207 MB | | |
| **Cloudflare server worker** | | | | |
| `handler.mjs` | 23.61 MB (gzip 5.21 MB) | — | 14.85 MB (gzip 3.82 MB) | |
| ↳ Shiki in handler | 8.69 MB | — | 0 | |
| Upload (wrangler dry-run) | 23 542 KiB (gzip 5 529 KiB) | — | 15 032 KiB (gzip 4 184 KiB) | |
| Server heap after first render | 53.3 MB | — | 52.9 MB | |
| Server heap after load | 71.6 MB | — | 52.9 MB (not comparable, see notes) | |
| **Client** | | | | |
| JS chunks | 12.60 MB (437 files) | 3.59 MB (142 files) | | |
| ↳ grammar chunks | 8.19 MB (236 files) | 0 (2 remaining `scopeName` chunks are the Shiki engine and an unrelated lib) | | |

Notes:
- First-request page timings on `next start` (~10 s) are dominated by API fetching, so cold
  highlighting cost is measured with the micro-benchmark instead.
- Next keeps `shiki` external on the server: grammars reach the Vercel function through the
  file trace, not `.next/server`.
- Task 2 also moved the client to assets (Task 4's switch), because the client could no longer
  import the server entry once it read from `node:fs`.
- Vercel: the grammars still ship in the function, as on-demand JSON instead of module files; the
  trace only shrinks by ~1 MB. A dynamic `join(process.cwd(), 'public/~gitbook/static', path)` made
  file tracing pull all of `static` (65 MB trace); keeping `shiki` in the literal fixed it.
- Cloudflare heap: the 3 follow-up requests re-rendered in the baseline run (~11 s each) but were
  served in <1 s after Task 3, so "after load" is not comparable. Heap after the first render is
  the like-for-like number: unchanged, since lazily imported grammar modules were never evaluated
  unless used. The Cloudflare gain is script size (−37 % raw, −24 % gzip upload), not heap.
- Cloudflare render verified on the split workers: quickstart page 200, 154 highlighted tokens
  (same as baseline), grammars read through the server worker's `ASSETS` binding.
- Task 4 (browser check, headless Chromium on `next start`): the quickstart page fetches
  `shiki/3.21.0/grammars/javascript.json` and `python.json` (200, `public, max-age=31536000,
  immutable`) and highlights client-rendered blocks; no theme requests, since the default themes
  are the custom ones kept in code. Cross-origin `GITBOOK_ASSETS_URL` not testable locally; static
  assets already send `Access-Control-Allow-Origin: *`. Bundle numbers unchanged from Task 2.

## Summary (baseline → final)

| Target | Baseline | Final | Change |
|---|---|---|---|
| Cloudflare server `handler.mjs` | 23.61 MB | 14.85 MB | −8.76 MB (−37 %) |
| Cloudflare upload, gzip | 5 529 KiB | 4 184 KiB | −1 345 KiB (−24 %) |
| Cloudflare server heap after first render | 53.3 MB | 52.9 MB | ≈ 0 (grammar modules were already lazy) |
| Client JS chunks | 12.60 MB / 437 files | 3.59 MB / 142 files | −9.02 MB (−72 %), −295 files |
| Client grammar chunks | 8.19 MB / 236 files | 0 | −100 % (grammars are fetched as JSON on demand, cached immutable) |
| Vercel page function trace | 20.01 MB | 19.02 MB | −1.0 MB (−5 %): grammars still ship, as JSON |
| Cold first highlight (3 langs) | 195 ms | 188 ms | ≈ 0 (no regression) |

Grammar assets: 247 deduplicated grammar files (7.3 MB) + 60 themes (1.4 MB), versus 9.7 MB of
language modules before; a flattened file per language would have been 39 MB.
