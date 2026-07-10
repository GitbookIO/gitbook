---
"gitbook": patch
---

Fix the docs embed not applying `?theme=light`/`?theme=dark`. The theme was dropped when the embed redirected to its default tab, and the embed tabs couldn't read it because they render statically (their request headers are empty). The middleware now threads a forced embed theme through the embed route context (scoped to the embed, not the main site), so the embed tabs honor it while staying statically rendered, and the redirect forwards it to the default tab. The forced theme is also persisted to the embed's own theme storage so it is remembered across tab navigation instead of only applying while the query string is present.
