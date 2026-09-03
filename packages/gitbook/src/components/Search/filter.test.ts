import { describe, expect, it } from 'bun:test';

import { computeFilterSiteSpaceIds } from './filter';

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
