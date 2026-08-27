---
"@gitbook/embed": patch
---

Make the Docs Embed widget match the page it is embedded in rather than the visitor's OS: a widget on a light page stays light even when the visitor's system is in dark mode, and the widget's own chrome and the docs inside it always render in the same scheme. Sites published with a single theme impose it on the widget too, since they render in it regardless. The standalone script takes `?theme=light` on its URL, and calling `init` twice now updates the options instead of throwing.
