---
"gitbook": patch
---

Serve `X-Robots-Tag: noindex` on internal search/assistant URLs (`?q=` / `?ask=`) and stop disallowing them in robots.txt, so Google can crawl the directive and drop them from the index instead of reporting "Indexed, though blocked by robots.txt".
