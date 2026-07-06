---
"gitbook": patch
---

Fix a light/dark flash on published sites configured to respect the system default (no theme toggle). The `<html>` `dark` class is now resolved before first paint by an inline `<head>` script that mirrors the client (`next-themes`) resolution order, so the cached/instant render no longer flashes light before switching to dark.
