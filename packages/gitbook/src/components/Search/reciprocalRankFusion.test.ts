import { describe, expect, it } from 'bun:test';

import {
    type MergedPageResult,
    fuseSearchResults,
    getResultKey,
    reciprocalRankFusion,
} from './reciprocalRankFusion';
import type { OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

function localPage(id: string, title = id, siteSpaceId = 'site-space-alpha'): LocalPageResult {
    return {
        type: 'local-page',
        id,
        siteSpaceId,
        title,
        pathname: `/${id}`,
        description: `Local description for ${title}`,
        breadcrumbs: [{ label: 'Local', icon: 'book-open' }],
    };
}

function remotePage(
    id: string,
    title = id,
    score = 0,
    rank = 1,
    spaceId = 'space-alpha',
    siteSpaceId = 'site-space-alpha'
): OrderedComputedResult {
    return {
        type: 'page',
        id: `remote-${id}`,
        pageId: id,
        spaceId,
        siteSpaceId,
        title,
        description: `Remote description for ${title}`,
        href: `/${id}`,
        score,
        rank,
        breadcrumbs: [{ label: 'Remote' }],
    };
}

function remoteRecord(id: string, title = id): OrderedComputedResult {
    return {
        type: 'record',
        id,
        title,
        href: `/records/${id}`,
        score: 0,
        description: undefined,
    };
}

describe('reciprocalRankFusion', () => {
    it('keeps the first 3 remote results first and in remote order', () => {
        const results = reciprocalRankFusion(
            [localPage('local-match', 'Alpha Local Match')],
            [
                remotePage('remote-1'),
                remoteRecord('remote-2'),
                remotePage('remote-3'),
                remotePage('remote-4'),
            ],
            'alpha'
        );

        expect(results.slice(0, 3).map(getResultKey)).toEqual([
            'page:remote-1',
            'record:remote-2',
            'page:remote-3',
        ]);
    });

    it('applies fusion only after the pinned remote results', () => {
        const results = reciprocalRankFusion(
            [localPage('local-match', 'Alpha Local Match')],
            [
                remotePage('remote-1'),
                remotePage('remote-2'),
                remotePage('remote-3'),
                remotePage('remote-4'),
            ],
            'alpha'
        );

        expect(results.slice(0, 3).map(getResultKey)).toEqual([
            'page:remote-1',
            'page:remote-2',
            'page:remote-3',
        ]);
        const firstFusedResult = results[3];
        if (!firstFusedResult) {
            throw new Error('Expected a fused result after the pinned remote results');
        }
        expect(getResultKey(firstFusedResult)).toBe('page:local-match');
    });

    it('pins all remote results when fewer than 3 are present', () => {
        const results = reciprocalRankFusion(
            [localPage('local-match', 'Alpha Local Match')],
            [remoteRecord('remote-1'), remotePage('remote-2')],
            'alpha'
        );

        expect(results.map(getResultKey)).toEqual([
            'record:remote-1',
            'page:remote-2',
            'page:local-match',
        ]);
    });

    it('merges a pinned remote page with the matching local page without duplicating it', () => {
        const results = reciprocalRankFusion(
            [localPage('remote-1', 'Local title')],
            [
                remotePage('remote-1', 'Remote title', 1, 1),
                remotePage('remote-2'),
                remotePage('remote-3'),
            ],
            'remote'
        );
        const pinnedResult = results[0] as MergedPageResult;

        expect(pinnedResult.type).toBe('page');
        expect(pinnedResult.title).toBe('Remote title');
        expect(pinnedResult.pathname).toBe('/remote-1');
        expect(pinnedResult.description).toBe('Remote description for Remote title');
        expect(pinnedResult.rank).toBe(1);
        expect(pinnedResult.breadcrumbs).toEqual([{ label: 'Local', icon: 'book-open' }]);
        expect(results.map(getResultKey).filter((key) => key === 'page:remote-1')).toHaveLength(1);
    });

    it('does not duplicate pinned records in the fused tail', () => {
        const results = reciprocalRankFusion(
            [],
            [
                remoteRecord('record-1'),
                remotePage('remote-2'),
                remotePage('remote-3'),
                remoteRecord('record-1'),
                remotePage('remote-4'),
            ],
            'remote'
        );

        expect(results.map(getResultKey).filter((key) => key === 'record:record-1')).toHaveLength(
            1
        );
    });
});

describe('fuseSearchResults', () => {
    it('filters every source to the current site space before fusion', () => {
        const results = fuseSearchResults({
            localResults: [
                localPage('local-alpha', 'Alpha local result'),
                localPage('remote-alpha-1', 'Beta local result', 'site-space-beta'),
            ],
            remoteResults: [
                remotePage('remote-alpha-1', 'Alpha remote one', 10, 1),
                remotePage(
                    'local-alpha',
                    'Beta remote result',
                    9,
                    2,
                    'space-beta',
                    'site-space-beta'
                ),
                remotePage('remote-alpha-2', 'Alpha remote two', 8, 3),
            ],
            query: 'result',
            allowedSiteSpaceIds: ['site-space-alpha'],
        });

        expect(results.map(getResultKey)).toEqual([
            'page:remote-alpha-1',
            'page:remote-alpha-2',
            'page:local-alpha',
        ]);
        expect(results[0]).not.toHaveProperty('pathname');
        expect(results[2]?.type).toBe('local-page');
    });

    it('preserves cross-site-space results when the search is unrestricted', () => {
        const results = fuseSearchResults({
            localResults: [
                localPage('local-alpha', 'Alpha local result'),
                localPage('local-beta', 'Beta local result', 'site-space-beta'),
            ],
            remoteResults: [
                remotePage('remote-alpha', 'Alpha remote result', 10, 1),
                remotePage(
                    'remote-beta',
                    'Beta remote result',
                    9,
                    2,
                    'space-beta',
                    'site-space-beta'
                ),
            ],
            query: 'result',
        });

        expect(results.map(getResultKey)).toEqual([
            'page:remote-alpha',
            'page:remote-beta',
            'page:local-alpha',
            'page:local-beta',
        ]);
    });

    it('preserves every allowed site space in an intentionally multi-space search', () => {
        const results = fuseSearchResults({
            localResults: [
                localPage('local-alpha'),
                localPage('local-beta', 'local-beta', 'site-space-beta'),
                localPage('local-gamma', 'local-gamma', 'site-space-gamma'),
            ],
            remoteResults: [
                remotePage('remote-alpha'),
                remotePage('remote-beta', 'remote-beta', 0, 2, 'space-beta', 'site-space-beta'),
                remotePage('remote-gamma', 'remote-gamma', 0, 3, 'space-gamma', 'site-space-gamma'),
            ],
            query: 'page',
            allowedSiteSpaceIds: ['site-space-alpha', 'site-space-beta'],
        });

        expect(results.map(getResultKey)).toEqual([
            'page:remote-alpha',
            'page:remote-beta',
            'page:local-alpha',
            'page:local-beta',
        ]);
    });
});
