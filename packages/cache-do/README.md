# `@gitbook/cache-do`

Cache backend, powered by Cloudflare Durable Objects. The cache is optimized for GitBook use-cases.

### Performances

The cache backend is optimized for performances by being distributed and accessible close to the worker locations that are reading it.

### Geo-distribution

To achieve a good balance between **performances** and **consistency**, cache objects are distributed over 7 locations, representing continents.

It makes it possible to pirge all 7 locations in one go and achieve fast consistency.

### Concepts

**Cache tag**: unique tag in the cache environment. A cache tag groups multiple keys that should be purged together in one operation.
Cache tags should not contain a large set of unique keys. Exceeding thousands could lead to performances or reliability issues.

**Cache key**: unique key in the cache environment. Each key should be assigned to a `tag`.

**Location**: cache is distributed over 7 unique locations, one for each continent.


