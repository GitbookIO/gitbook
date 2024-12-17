# `@gitbook/proxy`

Host a GitBook site on your own domain as a subpath.

## Usage

```ts
import { proxyToGitBook } from '@gitbook/proxy';

addEventListener("fetch", (event) => {
  event.respondWith(proxyToGitBook(event.request, {
    site: 'mycompany.gitbook.io/site/'
  }));
});
```

