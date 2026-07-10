---
"gitbook": patch
---

Embed: an explicit `?theme=light` / `?theme=dark` (the SDK `colorScheme` option) now reliably forces the embed's color scheme, even on sites where the theme toggle is disabled. Previously single-theme sites ignored the requested scheme.
