---
"gitbook": patch
---

Fix the docs embed `navigateToPage` API on multi-space sites. Deep-linking to a page in a different space/section (e.g. `navigateToPage('/help-center/integrations')`) previously 404'd because the section base was not placed before `~gitbook/embed/page`. The target is now resolved to its space server-side, so pages in any space resolve correctly. The input accepts the page path, an absolute path, or the full published URL.
