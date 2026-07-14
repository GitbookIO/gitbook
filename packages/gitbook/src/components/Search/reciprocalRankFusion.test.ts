import { describe, expect, it } from 'bun:test';
import { type MergedPageResult, getResultKey, reciprocalRankFusion } from './reciprocalRankFusion';
import type { OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

function localPage(id: string, title = id): LocalPageResult {
    return {
        type: 'local-page',
        id,
        title,
        pathname: `/${id}`,
        description: `Local description for ${title}`,
        breadcrumbs: [{ label: 'Local', icon: 'book-open' }],
    };
}

function remotePage(id: string, title = id): OrderedComputedResult {
    return {
        type: 'page',
        id: `remote-${id}`,
        pageId: id,
        spaceId: 'space',
        title,
        href: `/${id}`,
        score: 0,
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
            [],
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
            [],
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
            [],
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
                remotePage('remote-1', 'Remote title'),
                remotePage('remote-2'),
                remotePage('remote-3'),
            ],
            [],
            'remote'
        );
        const pinnedResult = results[0] as MergedPageResult;

        expect(pinnedResult.type).toBe('page');
        expect(pinnedResult.title).toBe('Remote title');
        expect(pinnedResult.pathname).toBe('/remote-1');
        expect(pinnedResult.description).toBe('Local description for Local title');
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
            [],
            'remote'
        );

        expect(results.map(getResultKey).filter((key) => key === 'record:record-1')).toHaveLength(
            1
        );
    });

    describe('other site spaces results', () => {
        it('appends them at the very bottom in their API order', () => {
            const results = reciprocalRankFusion(
                [localPage('local-match', 'Alpha Local Match')],
                [remotePage('remote-1'), remotePage('remote-2')],
                [remotePage('other-2'), remoteRecord('other-record'), remotePage('other-1')],
                'alpha'
            );

            expect(results.map(getResultKey)).toEqual([
                'page:remote-1',
                'page:remote-2',
                'page:local-match',
                'page:other-2',
                'record:other-record',
                'page:other-1',
            ]);
        });

        it('drops duplicates of pinned results', () => {
            const results = reciprocalRankFusion(
                [],
                [remotePage('remote-1'), remotePage('remote-2')],
                [remotePage('remote-1'), remotePage('other-1')],
                'remote'
            );

            expect(results.map(getResultKey)).toEqual([
                'page:remote-1',
                'page:remote-2',
                'page:other-1',
            ]);
        });

        it('keeps a matching local page in its fused position, enriched with the remote fields', () => {
            const results = reciprocalRankFusion(
                [localPage('other-1', 'Local title')],
                [
                    remotePage('remote-1'),
                    remotePage('remote-2'),
                    remotePage('remote-3'),
                    remotePage('remote-4'),
                ],
                [remotePage('other-1', 'Remote title'), remotePage('other-2')],
                'local'
            );

            expect(results.map(getResultKey)).toEqual([
                'page:remote-1',
                'page:remote-2',
                'page:remote-3',
                'page:other-1',
                'page:remote-4',
                'page:other-2',
            ]);

            const mergedResult = results[3] as MergedPageResult;
            expect(mergedResult.type).toBe('page');
            expect(mergedResult.title).toBe('Remote title');
            expect(mergedResult.description).toBe('Local description for Local title');
        });
    });
});
