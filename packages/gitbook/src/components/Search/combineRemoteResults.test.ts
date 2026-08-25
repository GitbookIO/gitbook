import { describe, expect, it } from 'bun:test';

import { CURRENT_SITE_SPACE_RRF_WEIGHT, combineRemoteResults } from './combineRemoteResults';
import type { ComputedPageResult, ComputedRecordResult } from './search-types';

function page(title: string, rank: number, score: number, spaceId: string): ComputedPageResult {
    return {
        type: 'page',
        id: `${spaceId}/${title}`,
        pageId: title,
        spaceId,
        title,
        description: `Description for ${title}`,
        href: `/${title}`,
        rank,
        score,
    };
}

function context(title: string, score: number): ComputedRecordResult {
    return {
        type: 'record',
        id: title,
        title,
        description: undefined,
        href: `/context/${title}`,
        score,
    };
}

describe('combineRemoteResults', () => {
    it('uses a 1% current-space RRF weight without changing either backend order', () => {
        const currentSpace = [
            page('Types of automations', 1, 1, 'runway'),
            page('Types of notifications', 2, 100, 'runway'),
            context('Runway context', 1_000),
        ];
        const otherSpaces = [
            page('Method URL', 1, 10_000, 'cardstream'),
            page('Detection overview', 2, 5_000, 'vectra'),
            context('Vectra context', 20_000),
        ];

        const results = combineRemoteResults(currentSpace, otherSpaces);

        expect(CURRENT_SITE_SPACE_RRF_WEIGHT).toBe(1.01);
        expect(results.map(({ title }) => title)).toEqual([
            'Types of automations',
            'Method URL',
            'Types of notifications',
            'Detection overview',
            'Runway context',
            'Vectra context',
        ]);
        expect(results.map(({ score }) => score)).toEqual([1, 10_000, 100, 5_000, 1_000, 20_000]);
        expect(
            results
                .filter(
                    (result): result is ComputedPageResult =>
                        result.type === 'page' && result.spaceId === 'runway'
                )
                .map(({ title }) => title)
        ).toEqual(['Types of automations', 'Types of notifications']);
        expect(
            results
                .filter(
                    (result): result is ComputedPageResult =>
                        result.type === 'page' && result.spaceId !== 'runway'
                )
                .map(({ title }) => title)
        ).toEqual(['Method URL', 'Detection overview']);
    });
});
