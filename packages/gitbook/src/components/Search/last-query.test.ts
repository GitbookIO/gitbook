import { describe, expect, it } from 'bun:test';

import { clearLastSearchQuery, getLastSearchQuery, setLastSearchQuery } from './last-query';

describe('last search query', () => {
    it('stores and retrieves the query', () => {
        setLastSearchQuery('current', 'query');

        expect(getLastSearchQuery('current')).toBe('query');
    });

    it('trims values and drops empty ones', () => {
        setLastSearchQuery('trimmed', '  query  ');
        expect(getLastSearchQuery('trimmed')).toBe('query');

        setLastSearchQuery('trimmed', '   ');
        expect(getLastSearchQuery('trimmed')).toBe(null);
    });

    it('clears the query after selection', () => {
        setLastSearchQuery('selected', 'query');
        clearLastSearchQuery('selected');

        expect(getLastSearchQuery('selected')).toBe(null);
    });
});
