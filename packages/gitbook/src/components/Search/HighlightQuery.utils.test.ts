import { describe, expect, it } from 'bun:test';
import { matchString } from './HighlightQuery.utils';

describe('matchString', () => {
    it('returns the whole text as a single non-match when nothing matches', () => {
        expect(matchString('MariaDB Cloud', 'postgres')).toEqual([{ text: 'MariaDB Cloud' }]);
    });

    it('highlights a single matching word', () => {
        expect(matchString('MariaDB Cloud', 'cloud')).toEqual([
            { text: 'MariaDB ' },
            { text: 'Cloud', match: 'cloud' },
        ]);
    });

    it('coalesces adjacent word matches into one highlight span', () => {
        // "maria db" matches "MariaDB" as two touching tokens; they must render
        // as a single highlight, not two overlapping pills.
        expect(matchString('MariaDB Cloud', 'maria db cloud')).toEqual([
            { text: 'MariaDB', match: 'mariadb' },
            { text: ' ' },
            { text: 'Cloud', match: 'cloud' },
        ]);
    });

    it('keeps non-adjacent matches as separate spans', () => {
        expect(matchString('MariaDB is a cloud database', 'maria cloud')).toEqual([
            { text: 'Maria', match: 'maria' },
            { text: 'DB is a ' },
            { text: 'cloud', match: 'cloud' },
            { text: ' database' },
        ]);
    });
});
