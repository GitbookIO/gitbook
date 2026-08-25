import assertNever from 'assert-never';

import type { SearchSiteContentScope } from './search-types';
import type { SearchScope } from './useSearch';

/** Map the UI scope to one backend request so every returned rank is globally comparable. */
export function computeRemoteSearchScope(
    scope: SearchScope,
    siteSpaceId: string,
    siteSpaceIds: string[]
): SearchSiteContentScope {
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
