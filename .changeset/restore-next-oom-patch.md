---
"gitbook": patch
---

Restore the Next.js dev-mode OOM patch that was silently dropped by the 16.3.6 upgrade (root `package.json`'s `patchedDependencies` still pinned it to the old `16.3.3` patch file, so Bun stopped applying it).
