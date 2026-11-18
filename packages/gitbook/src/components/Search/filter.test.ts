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

    it('default with sections → undefined (no local filter)', () => {
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
    const page = (id: string, siteSpaceId?: string): OrderedComputedResult => ({
        type: 'page',
        id,
        title: id,
        href: `/${id}`,
        score: 1,
        pageId: id,
        spaceId: 'space',
        siteSpaceId,
        description: '',
        rank: 1,
    });

    it('keeps the server order and drops pages outside the scope', () => {
        const results = [page('a', 'current'), page('b', 'other'), page('c', 'current'), page('d')];
        expect(filterResultsBySiteSpaces(results, ['current']).map((result) => result.id)).toEqual([
            'a',
            'c',
        ]);
    });

    it('returns every result when the scope is unrestricted', () => {
        const results = [page('b', 'other'), page('a', 'current')];
        expect(filterResultsBySiteSpaces(results, undefined)).toBe(results);
    });
});
