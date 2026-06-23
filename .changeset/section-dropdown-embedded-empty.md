---
"gitbook": patch
---

Fix grouped top-nav section dropdowns rendering empty when the site is embedded in an iframe (visitor-auth embeds, editor preview) or shown in the embeddable view. The dropdown viewport is composited and animated, and a clipped composited layer fails to rasterize its text in Chromium when painted inside a sub compositing root; the rounded-corner clipping is now done on an inner wrapper so the viewport itself is no longer clipped.
