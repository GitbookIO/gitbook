---
"@gitbook/colors": patch
"gitbook": patch
---

A near-white tint color (e.g. a warm `#F5F3EF`) is now taken as the exact page background, mirroring the existing behavior for near-black tints. The tint's exact lightness, hue and chroma are preserved, and the color is anchored to whichever scale step the active theme renders as the background — so it matches exactly on `muted` (which uses the second step) as well as the other themes. This only applies to near-neutral tints; saturated colors keep their normal accent scale.
