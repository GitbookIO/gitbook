import type { OrderedComputedResult } from './search-types';
import type { SearchScope } from './useSearch';

/**
 * Site spaces whose pages may be shown for a UI search scope, or `undefined` for no restriction.
 *
 * The server's "default" scope also returns pages from other site spaces. Without sections
 * (only variants) the UI presents "default" as the current variant, so it is restricted to
 * the current `siteSpaceId`. An explicitly selected section takes precedence.
 */
export function computeFilterSiteSpaceIds(
    scope: SearchScope,
    siteSpaceId: string,
    siteSpaceIds: string[],
    withSections?: boolean,
    selectedSectionSiteSpaceIds?: string[]
) {
    if (selectedSectionSiteSpaceIds) {
        return selectedSectionSiteSpaceIds;
    }

    switch (scope) {
        case 'current':
            return [siteSpaceId];
        case 'extended':
            return siteSpaceIds;
        default:
            return withSections ? undefined : [siteSpaceId];
    }
}

/** Keep the server's order, dropping pages owned by a site space outside the scope. */
export function filterResultsBySiteSpaces(
    results: OrderedComputedResult[],
    allowedSiteSpaceIds: string[] | undefined
): OrderedComputedResult[] {
    if (!allowedSiteSpaceIds) {
        return results;
    }

    const allowed = new Set(allowedSiteSpaceIds);

    return results.filter(
        (result) =>
            result.type === 'record' ||
            (result.siteSpaceId !== undefined && allowed.has(result.siteSpaceId))
    );
}
