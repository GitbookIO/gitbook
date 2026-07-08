---
"gitbook": patch
---

Fix the docs embed not applying `?theme=light`/`?theme=dark`. The theme was dropped when the embed redirected to its default tab, and even when kept it was ignored because the assistant/search tabs were forced static (so the theme header was never read). The embed now forwards the query on redirect and reads the forced theme on every tab. The forced theme is also persisted to the embed's own theme storage, so it is remembered across tab navigation and reloads instead of only applying while the query string is present.
