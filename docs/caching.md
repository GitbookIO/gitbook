# Caching

## Revalidating the cache

Invalidate cache can be done at two levels using tags:

- Data fetching cache
- Rendering cache

To invalidate and refetch the data cache, you can execute a POST request to `/~/gitbook/revalidate`:

```bash
curl --location --request POST 'https://gitbook/mycompany.com/~gitbook/revalidate' \
--header 'Content-Type: application/json' \
--data-raw '{"tags": ["space.id"]}'
```

To invalidate the rendering cache, the implementation mainly depends on the infrastructure serving the content, GitBook outputs a `Cache-Tag` header on every requests. The value of the header is a comma separated list of tags.

## Purging the cache

Purging the cache, without revalidating, is done by passing `"purge": true` in the request body.
