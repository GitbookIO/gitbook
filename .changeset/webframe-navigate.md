---
"@gitbook/react-contentkit": patch
"gitbook": patch
---

Let integration block webframes navigate the reader to another page in the site by posting a `@webframe.navigate` action with a `path` (and optional `anchor`). Resolved client-side against the site base path, so navigation stays in-site and drives the standard navigation progress bar.
