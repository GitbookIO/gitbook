import { describe, expect, it } from 'bun:test';

import { computeFilterSiteSpaceIds, filterResultsBySiteSpaces } from './filter';
import type { OrderedComputedResult } from './search-types';

describe('computeFilterSiteSpaceIds', () => {
    const currentId = 'space-current';
    const ids = ['space-a', 'space-b', currentId];

    it('current → [siteSpaceId]', () => {
        const r = computeFilterSiteSpaceIds('current', currentId, ids, true);
        expect(r).toEqual([currentId]);
    });

    it('extended → siteSpaceIds', () => {
        const r = computeFilterSiteSpaceIds('extended', currentId, ids, true);
        expect(r).toEqual(ids);
    });

    it('default with sections → undefined (no filter)', () => {
        const r = computeFilterSiteSpaceIds('default', currentId, ids, true);
        expect(r).toBeUndefined();
    });

    it('default without sections → [siteSpaceId] (align to remote)', () => {
        const r = computeFilterSiteSpaceIds('default', currentId, ids, false);
        expect(r).toEqual([currentId]);
    });

    it('filters to an independently selected section', () => {
        const r = computeFilterSiteSpaceIds('extended', currentId, ids, true, [
            'space-other-a',
            'space-other-b',
        ]);
        expect(r).toEqual(['space-other-a', 'space-other-b']);
    });
});

describe('filterResultsBySiteSpaces', () => {
    const page = (pageId: string, siteSpaceId?: string): OrderedComputedResult => ({
        type: 'page',
        id: `space/${pageId}`,
        title: pageId,
        description: '',
        href: `/${pageId}`,
        pageId,
        spaceId: 'space',
        siteSpaceId,
        score: 1,
        rank: 1,
    });
    const record: OrderedComputedResult = {
        type: 'record',
        id: 'record',
        title: 'Record',
        description: undefined,
        href: 'https://example.com',
        score: 1,
    };
    const inScope = page('b', 'current');
    const alsoInScope = page('d', 'current');
    const results = [page('a', 'other'), inScope, record, page('c'), alsoInScope];

    it('keeps the server order and drops pages outside the allowed site spaces', () => {
        expect(filterResultsBySiteSpaces(results, ['current'])).toEqual([
            inScope,
            record,
            alsoInScope,
        ]);
    });

    it('returns every result when the scope is unrestricted', () => {
        expect(filterResultsBySiteSpaces(results, undefined)).toBe(results);
    });
});
