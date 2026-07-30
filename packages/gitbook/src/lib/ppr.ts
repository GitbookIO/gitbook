export type SiteRouteType = 'dynamic' | 'static' | 'ppr';

export type PPRRequest = {
    lookupURL: string;
    structureToken: string;
    tocToken: string;
    pageToken: string;
    revisionId: string;
    revalidationId: string;
};

// We need to find a better way than having to pass 3 different tokens
// We should also not have to encode 3 different API tokens in the URL, but for a POC it's fine
// This is not true PPR, but in combination with what we are doing in the background,
// it will allow us to cache the different regions independently and invalidate them when needed
export const PPRRequestHeaders = {
    LookupURL: 'x-gbo-lookup-url',
    StructureToken: 'x-gbo-struct-token',
    TOCToken: 'x-gbo-toc-token',
    PageToken: 'x-gbo-page-token',
    RevisionID: 'x-gbo-revision-id',
    RevalidationID: 'x-gbo-revalidation-id',
} as const;

/**
 * PPR needs independently scoped tokens for each cached region, so partial header sets
 * must continue through the regular rendering path.
 */
export function getPPRRequest(headers: Headers): PPRRequest | undefined {
    const lookupURL = headers.get(PPRRequestHeaders.LookupURL);
    const structureToken = headers.get(PPRRequestHeaders.StructureToken);
    const tocToken = headers.get(PPRRequestHeaders.TOCToken);
    const pageToken = headers.get(PPRRequestHeaders.PageToken);
    const revisionId = headers.get(PPRRequestHeaders.RevisionID);
    const revalidationId = headers.get(PPRRequestHeaders.RevalidationID);

    if (
        !lookupURL ||
        !structureToken ||
        !tocToken ||
        !pageToken ||
        !revisionId ||
        !revalidationId
    ) {
        return undefined;
    }

    return {
        lookupURL,
        structureToken,
        tocToken,
        pageToken,
        revisionId,
        revalidationId,
    };
}

/**
 * Keep the PPR rollout limited to ordinary static document pages.
 */
export function getPPRRouteType(
    routeType: SiteRouteType,
    isPPRPage: boolean | undefined,
    pprRequest: PPRRequest | undefined
): SiteRouteType {
    return routeType === 'static' && isPPRPage && pprRequest ? 'ppr' : routeType;
}
