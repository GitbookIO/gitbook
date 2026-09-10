---
"gitbook": patch
---

Fix analytics and adaptive content silently breaking on sites served from a different host than the one configured (apex vs www, domain alias, CDN). The insights and visitor-claims endpoints are now requested relative to the page's own origin instead of the configured host, which a prerendered page cannot know.
