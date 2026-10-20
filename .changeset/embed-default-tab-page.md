---
"@gitbook/embed": minor
"gitbook": patch
---

Add `defaultTab` and `defaultPage` options to the Docs Embed to choose where it opens. `defaultTab` opens the embed on the assistant, search or docs tab. `defaultPage` sets the page the docs tab opens on in place of the site's home page, and the embed opens on that page unless `defaultTab` says otherwise. Both work with the standalone script's `configure`, `frame.configure` and `<GitBookFrame>` props.
