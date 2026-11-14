/**
 * Short-lived credential for a visitor's browser to search a published site with the API directly.
 */
export type SearchPassFields = {
    token: string;
    expiresAt: string;
    endpoint: string;
};

/**
 * Why a search went to the search route after the visitor's browser held a search pass.
 */
export type SearchFallbackReason =
    | 'invalid_endpoint'
    | 'unauthorized'
    | 'refresh_failed'
    | 'forbidden'
    | 'rate_limited'
    | 'server_error'
    | 'unexpected_status'
    | 'network'
    | 'invalid_response'
    | 'unknown_space';

export const SEARCH_FALLBACK_REASONS: readonly SearchFallbackReason[] = [
    'invalid_endpoint',
    'unauthorized',
    'refresh_failed',
    'forbidden',
    'rate_limited',
    'server_error',
    'unexpected_status',
    'network',
    'invalid_response',
    'unknown_space',
];

/** Request header naming the reason a search was sent to the search route instead of the API. */
export const SEARCH_FALLBACK_HEADER = 'x-gitbook-search-fallback';

/**
 * Read the search pass fields from a warm-up reply, or null when they are missing or malformed.
 */
export function readSearchPassFields(value: unknown): SearchPassFields | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const { token, expiresAt, endpoint } = value as Record<string, unknown>;
    if (
        typeof token !== 'string' ||
        typeof expiresAt !== 'string' ||
        typeof endpoint !== 'string' ||
        !token ||
        Number.isNaN(Date.parse(expiresAt))
    ) {
        return null;
    }

    return { token, expiresAt, endpoint };
}

/**
 * Read the search pass from the API's warm-up reply body, or null when it holds no valid one.
 */
export function readSearchPassFromPrewarmReply(body: unknown): SearchPassFields | null {
    if (!body || typeof body !== 'object') {
        return null;
    }
    return readSearchPassFields((body as { searchPass?: unknown }).searchPass);
}

/**
 * Whether `endpoint` is the search operation of the site on the configured public API.
 */
export function isSearchPassEndpoint(
    endpoint: string,
    target: { apiURL: string; organizationId: string; siteId: string }
): boolean {
    if (!URL.canParse(endpoint) || !URL.canParse(target.apiURL)) {
        return false;
    }

    const url = new URL(endpoint);
    const expectedPath = `/v1/orgs/${encodeURIComponent(target.organizationId)}/sites/${encodeURIComponent(target.siteId)}/search`;

    return (
        url.origin === new URL(target.apiURL).origin &&
        url.pathname === expectedPath &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash
    );
}

/**
 * What the browser does after the API answers a search made with a search pass.
 */
export type SearchPassStatusOutcome =
    | { type: 'results' }
    | { type: 'refresh' }
    | { type: 'back_off' }
    | { type: 'fall_back'; reason: SearchFallbackReason };

/**
 * Classify the HTTP status of a search made with a search pass.
 */
export function classifySearchPassStatus(status: number): SearchPassStatusOutcome {
    if (status >= 200 && status < 300) {
        return { type: 'results' };
    }
    if (status === 401) {
        return { type: 'refresh' };
    }
    if (status === 403) {
        return { type: 'fall_back', reason: 'forbidden' };
    }
    if (status === 429) {
        return { type: 'back_off' };
    }
    if (status >= 500) {
        return { type: 'fall_back', reason: 'server_error' };
    }
    return { type: 'fall_back', reason: 'unexpected_status' };
}
