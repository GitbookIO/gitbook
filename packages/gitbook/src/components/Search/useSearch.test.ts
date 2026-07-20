import { describe, expect, it } from 'bun:test';

import { shouldKeepSearchState } from './useSearch';

describe('shouldKeepSearchState', () => {
    it('keeps a non-default scope after q and ask are cleared', () => {
        expect(shouldKeepSearchState({ q: null, ask: null, scope: 'current' })).toBe(true);
    });

    it('discards an empty state with the default scope', () => {
        expect(shouldKeepSearchState({ q: null, ask: null, scope: 'default' })).toBe(false);
    });
});
