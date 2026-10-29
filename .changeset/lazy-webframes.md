---
"@gitbook/react-contentkit": patch
---

Load a webframe only once it is near the viewport. A page can hold hundreds of them inside collapsed expandables, and loading every one on mount held up the first paint.
