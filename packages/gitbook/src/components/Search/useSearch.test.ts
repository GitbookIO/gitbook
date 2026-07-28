import { describe, expect, it } from 'bun:test';
import { shouldKeepSearchState } from './useSearch';

describe('shouldKeepSearchState', () => {
    it('discards an empty default search state', () => {
        expect(
            shouldKeepSearchState({
                q: null,
                ask: null,
                scope: 'default',
            })
        ).toBe(false);
    });

    it('keeps a non-default scope without a query', () => {
        expect(
            shouldKeepSearchState({
                q: null,
                ask: null,
                scope: 'current',
            })
        ).toBe(true);
    });
});
