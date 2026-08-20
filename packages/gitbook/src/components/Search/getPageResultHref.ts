import type { ComputedPageResult } from './search-types';

/** Return the page top for page matches and the preview anchor for section matches. */
export function getPageResultHref(
    result: Pick<ComputedPageResult, 'bestSection' | 'href' | 'resultType'>
): string {
    if (result.resultType === 'page') {
        return result.href;
    }

    return result.bestSection?.body ? result.bestSection.href : result.href;
}
