---
"@gitbook/react-contentkit": patch
"gitbook": patch
---

Expose the current page (`id`, `path`, `title`) to integration block webframes through the client-only webframe state, and let webframes navigate to other pages in the site via the `@webframe.navigate` action (by `pageId` or `path`), alongside adaptive visitor claims.
