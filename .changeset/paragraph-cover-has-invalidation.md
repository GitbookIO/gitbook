---
"gitbook": patch
---

Move paragraph block styles behind a single `paragraph` class and drop the `page-cover-background:` gate from the cover-contrast text. The gate combined with the per-paragraph `:not(:has(...))` made every DOM insertion re-style all paragraphs, which froze very long pages.
