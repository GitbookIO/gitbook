const INDEXING_CRAWLER_USER_AGENT_PATTERNS = [
    // Conventional search engines
    'googlebot',
    'bingbot',
    'yandexbot',
    'baiduspider',
    'duckduckbot',
    // AI training and indexing crawlers
    // We try to be conservative here, and only act on bot causing excessive load
    'meta-externalagent',
    'meta-webindexer',
    'amazonbot',
] as const;

function isIndexingCrawler(request: Request): boolean {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
    return INDEXING_CRAWLER_USER_AGENT_PATTERNS.some((pattern) => userAgent.includes(pattern));
}

/**
 * Clear internal search state for indexing crawlers without changing unrelated query parameters.
 */
export function getSearchParamsForIndexingCrawler(request: Request): URLSearchParams {
    const searchParams = new URL(request.url).searchParams;
    if (!isIndexingCrawler(request)) {
        return searchParams;
    }

    for (const parameter of ['ask', 'q']) {
        if (searchParams.has(parameter)) {
            searchParams.set(parameter, '');
        }
    }

    return searchParams;
}
