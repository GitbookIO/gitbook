---
"gitbook": patch
---

Show where a page lives in the site at the start of the page breadcrumbs: its section (including any enclosing section groups) and variant. When there's more than one such item to show (and the page has breadcrumbs), they're collapsed behind a "…" that expands on hover; otherwise they're shown inline. Restyle the breadcrumbs to normal casing (matching search results). Hovering any breadcrumb item reveals a dropdown to switch to its siblings at the same level — other section groups, sections, variants, page groups or pages — computed on the server from already-available data (no extra request).
