---
"gitbook": patch
---

Fix the docs embed `navigateToPage` API so it also accepts a page's full published URL, not just its path within the site. Previously passing a full URL (the natural thing to reach for) navigated to a non-existent page. For sites served from a subdirectory, provide the path relative to the docs root (omit the subdirectory) or pass the full URL.
