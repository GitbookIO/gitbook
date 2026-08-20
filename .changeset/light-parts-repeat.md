---
"gitbook": patch
---

Stop preloading the zoom-modal variant of every zoomable image at render time; it downloaded each image twice during the initial page load. The modal image still loads on hover or click.
