export type SiteRouteType = 'dynamic' | 'static' | 'ppr';

export type PPRRequest = {
    lookupURL: string;
    structureToken: string;
    tocToken: string;
    pageToken: string;
};

export const PPRRequestHeaders = {
    LookupURL: 'x-gbo-lookup-url',
    StructureToken: 'x-gbo-struct-token',
    TOCToken: 'x-gbo-toc-token',
    PageToken: 'x-gbo-page-token',
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

    if (!lookupURL || !structureToken || !tocToken || !pageToken) {
        return undefined;
    }

    return {
        lookupURL,
        structureToken,
        tocToken,
        pageToken,
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
