import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const serverUrlCache = createSearchParamsCache({
    serverUrl: parseAsString,
});
