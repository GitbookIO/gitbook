# Shiki assets — measurements

Commands (from `packages/gitbook`):
- Next: `bun run build:local && bun scripts/measure-shiki-bundles.ts next`
- Cold highlight: `bun scripts/bench-highlight-cold.ts 7` (fresh process per run, first highlight of javascript + python + vue; medians)
- Cloudflare: `bun run build:cloudflare && bun scripts/measure-shiki-bundles.ts cloudflare`
- Worker memory: wipe `openNext/customWorkers/.wrangler`, then
  `PROFILE_URL=http://127.0.0.1:8771/url/gitbook.com/docs/developers/gitbook-api/quickstart PROFILE_REQUESTS=3 PROFILE_FORCE_GC=true bun scripts/profile-opennext-memory.ts`
  (page with highlighted code; heap of the server worker after the first render and after 3 more)

| Metric | Baseline | Task 2 | Task 3 | Task 4 |
|---|---|---|---|---|
| **Vercel / Node** | | | | |
| Page function trace, total | 20.01 MB (760 files) | | | |
| ↳ Shiki langs/themes in trace | 9.29 MB | | | |
| Cold import of `highlight` (median) | 183 ms | | | |
| Cold first highlight, 3 langs (median) | 195 ms | | | |
| RSS after first highlight (median) | 207 MB | | | |
| **Cloudflare server worker** | | | | |
| `handler.mjs` | 23.61 MB (gzip 5.21 MB) | | | |
| ↳ Shiki in handler | 8.69 MB | | | |
| Upload (wrangler dry-run) | 23 542 KiB (gzip 5 529 KiB) | | | |
| Server heap after first render | 53.3 MB | | | |
| Server heap after load | 71.6 MB | | | |
| **Client** | | | | |
| JS chunks | 12.60 MB (437 files) | | | |
| ↳ grammar chunks | 8.19 MB (236 files) | | | |

Notes:
- First-request page timings on `next start` (~10 s) are dominated by API fetching, so cold
  highlighting cost is measured with the micro-benchmark instead.
- Next keeps `shiki` external on the server: grammars reach the Vercel function through the
  file trace, not `.next/server`.
