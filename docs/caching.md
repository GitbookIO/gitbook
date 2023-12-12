# Caching

## Invalidate the cache

Invalidate cache can be done at two levels using tags:

-   Data fetching cache
-   Rendering cache

To invalidate the data fetching cache, you can execute a POST request to `/.revalidate`:

```bash
curl --location --request POST 'https://gitbook/mycompany.com/.revalidate' \
--header 'Content-Type: application/json' \
--data-raw '{"tags": ["space.id"]}'
```

To invalidate the rendering cache, the implementation mainly depends on the infrastructure serving the content, GitBook outputs a `Cache-Tag` header on every requests. The value of the header is a comma separated list of tags.
