---
"@gitbook/embed": minor
"gitbook": patch
---

Emit a `navigate` event from the Docs Embed when the reader opens a page or switches tab, with the page's path, URL and title. Listen to it, and to `close` and `escape`, with `GitBook('on', ...)` in the standalone script or the `onNavigate`, `onClose` and `onEscape` props of `<GitBookFrame>`.
