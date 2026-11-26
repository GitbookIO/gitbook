import { describe, expect, it } from 'bun:test';

import { computeFilterSiteSpaceIds, getDisplayedSearchResults } from './filter';
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

describe('getDisplayedSearchResults', () => {
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
        expect(getDisplayedSearchResults(results, ['current']).map((result) => result.id)).toEqual([
            'a',
            'c',
        ]);
    });

    it('returns every result when the scope is unrestricted', () => {
        const results = [page('b', 'other'), page('a', 'current')];
        expect(getDisplayedSearchResults(results, undefined)).toBe(results);
    });

    it('caps the displayed list after applying the site space filter', () => {
        const pages = Array.from({ length: 10 }, (_, index) => page(`page-${index}`, 'current'));
        const records = Array.from({ length: 11 }, (_, index): OrderedComputedResult => ({
            type: 'record',
            id: `record-${index}`,
            title: `Record ${index}`,
            description: undefined,
            href: `/record-${index}`,
            score: 1,
        }));
        const results = [page('hidden', 'other'), ...pages, ...records];

        expect(getDisplayedSearchResults(results, ['current'])).toEqual([
            ...pages,
            ...records.slice(0, 10),
        ]);
    });
});
