import { describe, expect, it } from 'bun:test';
import { isPageTitleMatch } from './isPageTitleMatch';

describe('isPageTitleMatch', () => {
    it('matches when every query word is a substring of the title', () => {
        expect(isPageTitleMatch('EDR Integrations', 'EDR Integrations')).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(isPageTitleMatch('edr integrations', 'EDR Integrations')).toBe(true);
    });

    it('matches when the title contains the query as part of a longer title', () => {
        expect(isPageTitleMatch('EDR', 'EDR Integrations')).toBe(true);
    });

    it('does not match a section-level query whose words are not all in the title', () => {
        expect(isPageTitleMatch('selecting crowdstrike URL', 'EDR Integrations')).toBe(false);
    });

    it('requires every query word to appear in the title', () => {
        expect(isPageTitleMatch('EDR missing', 'EDR Integrations')).toBe(false);
    });

    it('returns false for an empty query', () => {
        expect(isPageTitleMatch('', 'EDR Integrations')).toBe(false);
    });

    it('returns false for a whitespace-only query', () => {
        expect(isPageTitleMatch('   ', 'EDR Integrations')).toBe(false);
    });

    it('ignores extra whitespace between query words', () => {
        expect(isPageTitleMatch('  EDR   Integrations  ', 'EDR Integrations')).toBe(true);
    });

    it('matches substrings within a title word (substring heuristic)', () => {
        expect(isPageTitleMatch('api', 'Rapid start')).toBe(true);
    });
});
