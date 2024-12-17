# `@gitbook/proxy`

Host a GitBook site on your own domain as a subpath.

## Usage

```ts
import { proxyToGitBook } from '@gitbook/proxy';

const site = proxyToGitBook(event.request, {
    site: 'mycompany.gitbook.io/site/',
    basePath: '/docs',
});

export default {
    async fetch(request) {
        // If the requst matches the basePath /docs, we serve from GitBook
        if (site.match(request)) {
            return site.fetch(request);
        }

        // Otherwise we do something else.
        return new Response('Not found', {
            statusCode: 404,
        });
    },
};
```
