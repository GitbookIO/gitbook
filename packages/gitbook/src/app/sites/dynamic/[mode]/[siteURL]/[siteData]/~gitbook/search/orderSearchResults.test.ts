import { describe, expect, it } from 'bun:test';

import { orderSearchResultGroups } from './orderSearchResults';

describe('orderSearchResultGroups', () => {
    it('reconstructs canonical page ranks across space groups before context records', () => {
        const results = orderSearchResultGroups([
            {
                type: 'pages',
                results: [
                    {
                        rank: 4,
                        result: { title: 'Snyk CLI documentation', score: 42, rank: 4 },
                    },
                    {
                        rank: 2,
                        result: { title: 'Types of automations', score: 12, rank: 2 },
                    },
                ],
            },
            {
                type: 'context',
                results: [{ title: 'Snyk integration context', score: 100, rank: undefined }],
            },
            {
                type: 'pages',
                results: [
                    {
                        rank: 1,
                        result: { title: 'Snyk CLI', score: 1, rank: 1 },
                    },
                    {
                        rank: 3,
                        result: { title: 'Method URL', score: 24, rank: 3 },
                    },
                ],
            },
        ]);

        expect(results.map(({ title }) => title)).toEqual([
            'Snyk CLI',
            'Types of automations',
            'Method URL',
            'Snyk CLI documentation',
            'Snyk integration context',
        ]);
        expect(results[0]?.score).toBe(1);
        expect(results[3]?.score).toBe(42);
        expect(results.map(({ rank }) => rank)).toEqual([1, 2, 3, 4, undefined]);
    });
});
