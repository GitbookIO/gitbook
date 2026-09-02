import type { SearchScope } from './useSearch';

/**
 * Map UI search scope to local FlexSearch filtering.
 *
 * Rationale: when a site has no sections (only variants), the remote search
 * "default" scope effectively queries the current variant. To keep local
 * results consistent with remote ones, we also restrict "default" to the
 * current `siteSpaceId` when `withSections` is false. Otherwise (sections
 * present), local "default" stays unfiltered to match the broader section UI.
 * An explicitly selected section takes precedence over these legacy scopes.
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
