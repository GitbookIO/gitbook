import type { PublishedSiteContent } from '@gitbook/api';

export type SiteRouteType = 'dynamic' | 'static' | 'ppr';

export type PPRRequest = {
    content: PublishedSiteContent & { revision: string };
    revalidationId: string;
};

export const PPRRequestHeaders = {
    Site: 'x-gbo-site',
    SiteSection: 'x-gbo-site-section',
    SiteSpace: 'x-gbo-site-space',
    Space: 'x-gbo-space',
    SiteBasePath: 'x-gbo-site-base-path',
    BasePath: 'x-gbo-base-path',
    Pathname: 'x-gbo-pathname',
    Organization: 'x-gbo-organization',
    ShareKey: 'x-gbo-share-key',
    Complete: 'x-gbo-complete',
    ContextID: 'x-gbo-context-id',
    CanonicalURL: 'x-gbo-canonical-url',
    Preview: 'x-gbo-preview',
    Revision: 'x-gbo-revision',
    ChangeRequest: 'x-gbo-change-request',
    APIToken: 'x-gbo-api-token',
    RevalidationID: 'x-gbo-revalidation-id',
} as const;

/**
 * GBO has already resolved PPR requests, so a complete header set can skip URL resolution.
 */
export function getPPRRequest(headers: Headers): PPRRequest | undefined {
    const site = getRequiredHeader(headers, PPRRequestHeaders.Site);
    const siteSpace = getRequiredHeader(headers, PPRRequestHeaders.SiteSpace);
    const space = getRequiredHeader(headers, PPRRequestHeaders.Space);
    const siteBasePath = getRequiredHeader(headers, PPRRequestHeaders.SiteBasePath);
    const basePath = getRequiredHeader(headers, PPRRequestHeaders.BasePath);
    const pathname = getRequiredHeader(headers, PPRRequestHeaders.Pathname);
    const organization = getRequiredHeader(headers, PPRRequestHeaders.Organization);
    const complete = getBooleanHeader(headers, PPRRequestHeaders.Complete);
    const canonicalUrl = getRequiredHeader(headers, PPRRequestHeaders.CanonicalURL);
    const apiToken = getRequiredHeader(headers, PPRRequestHeaders.APIToken);
    const preview = getBooleanHeader(headers, PPRRequestHeaders.Preview);
    const revision = getRequiredHeader(headers, PPRRequestHeaders.Revision);
    const revalidationId = headers.get(PPRRequestHeaders.RevalidationID);

    if (
        !site ||
        !siteSpace ||
        !space ||
        !siteBasePath ||
        !basePath ||
        !pathname ||
        !organization ||
        complete === undefined ||
        !canonicalUrl ||
        !apiToken ||
        (headers.get(PPRRequestHeaders.Preview) && preview === undefined) ||
        !revision ||
        !revalidationId
    ) {
        return undefined;
    }

    return {
        content: {
            site,
            siteSection: getOptionalHeader(headers, PPRRequestHeaders.SiteSection),
            siteSpace,
            space,
            siteBasePath,
            basePath,
            pathname,
            organization,
            shareKey: getOptionalHeader(headers, PPRRequestHeaders.ShareKey),
            complete,
            contextId: getOptionalHeader(headers, PPRRequestHeaders.ContextID),
            canonicalUrl,
            preview,
            revision,
            changeRequest: getOptionalHeader(headers, PPRRequestHeaders.ChangeRequest),
            apiToken,
        },
        revalidationId,
    };
}

function getRequiredHeader(headers: Headers, name: string): string | undefined {
    return getOptionalHeader(headers, name);
}

function getOptionalHeader(headers: Headers, name: string): string | undefined {
    return headers.get(name) || undefined;
}

function getBooleanHeader(headers: Headers, name: string): boolean | undefined {
    const value = getOptionalHeader(headers, name);
    if (!value) {
        return undefined;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
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
