import type { OrderedComputedResult } from './search-types';
import type { SearchScope } from './useSearch';

// Keep aligned with SiteInsightsSearchResultNumber in the GitBook API schema.
const MAX_DISPLAYED_SEARCH_RESULTS = 20;

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

/** Keep the first results in server order within the selected site spaces. */
export function getDisplayedSearchResults<Result extends OrderedComputedResult>(
    results: Result[],
    allowedSiteSpaceIds: string[] | undefined
): Result[] {
    const allowed = allowedSiteSpaceIds && new Set(allowedSiteSpaceIds);
    const matching = allowed
        ? results.filter(
              (result) =>
                  result.type === 'record' ||
                  (result.siteSpaceId !== undefined && allowed.has(result.siteSpaceId))
          )
        : results;
    return matching.length > MAX_DISPLAYED_SEARCH_RESULTS
        ? matching.slice(0, MAX_DISPLAYED_SEARCH_RESULTS)
        : matching;
}
