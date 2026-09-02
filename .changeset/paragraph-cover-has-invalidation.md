---
"gitbook": patch
---

Drop the `page-cover-background:` gate from the paragraph cover-contrast class. Combined with the per-paragraph `:not(:has(...))`, it made every DOM insertion re-style all paragraphs on the page, which froze very long pages.
