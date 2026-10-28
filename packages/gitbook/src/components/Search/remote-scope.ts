import assertNever from 'assert-never';

import type { SearchSiteContentScope } from './search-types';
import type { SearchScope } from './useSearch';

/** Map the UI scope (and any explicit section selection) to one globally ranked request. */
export function computeRemoteSearchScope(
    scope: SearchScope,
    siteSpaceId: string,
    siteSpaceIds: string[],
    selectedSectionSiteSpaceIds?: string[]
): SearchSiteContentScope {
    if (selectedSectionSiteSpaceIds) {
        return { mode: 'specific', siteSpaceIds: selectedSectionSiteSpaceIds };
    }

    switch (scope) {
        case 'all':
            return { mode: 'all' };
        case 'default':
            return { mode: 'current', siteSpaceId };
        case 'extended':
            return { mode: 'specific', siteSpaceIds };
        case 'current':
            return { mode: 'specific', siteSpaceIds: [siteSpaceId] };
        default:
            assertNever(scope);
    }
}
