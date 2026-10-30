---
"@gitbook/react-contentkit": patch
---

Load a webframe only once it is near the viewport, and keep its spinner up until the frame actually arrives. A page can hold hundreds of them inside collapsed expandables, and loading every one on mount held up the first paint.
