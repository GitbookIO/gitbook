---
"gitbook": patch
---

Fix the docs embed `navigateToPage` API so it also accepts a page's absolute path and full published URL, not just its path within the site. Previously, on sites hosted on a subdirectory (e.g. `example.com/docs`), passing the page's URL or address-bar path navigated to a non-existent page.
