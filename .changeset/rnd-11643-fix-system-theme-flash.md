---
"gitbook": patch
---

Fix a light/dark flash on published sites configured to respect the system default (no theme toggle). Such sites forced the `system` theme, but `next-themes`' pre-paint script applies a forced value verbatim without resolving `prefers-color-scheme`, so the page painted light and only switched to dark after hydration. We now leave the theme unforced when the default is `system` (only concrete light/dark themes are forced), letting `next-themes`' existing pre-paint script resolve the system preference before first paint.
