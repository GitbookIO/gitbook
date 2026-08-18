const AI_TRAINING_OR_INDEXING_USER_AGENT_PATTERNS = [
    // We try to be conservative here, and only act on bot causing excessive load
    'meta-externalagent',
    'meta-webindexer',
    'amazonbot',
] as const;

function isAITrainingOrIndexingCrawler(request: Request): boolean {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';
    return AI_TRAINING_OR_INDEXING_USER_AGENT_PATTERNS.some((pattern) =>
        userAgent.includes(pattern)
    );
}

/**
 * Detect AI training and indexing crawlers accessing an internal search endpoint.
 */
export function isAITrainingOrIndexingRequest(request: Request): boolean {
    if (!isAITrainingOrIndexingCrawler(request)) {
        return false;
    }

    const searchParams = new URL(request.url).searchParams;
    return searchParams.has('ask') || searchParams.has('q');
}
