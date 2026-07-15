import { describe, expect, it } from 'bun:test';
import { isPageTitleMatch } from './isPageTitleMatch';

describe('isPageTitleMatch', () => {
    it('matches when the query equals the title', () => {
        expect(isPageTitleMatch('EDR Integrations', 'EDR Integrations')).toBe(true);
    });

    it('is case-insensitive and tolerant of extra whitespace', () => {
        expect(isPageTitleMatch('  edr   integrations ', 'EDR Integrations')).toBe(true);
    });

    it('matches when word order differs', () => {
        expect(isPageTitleMatch('integrations edr', 'EDR Integrations')).toBe(true);
    });

    it('matches a single title word', () => {
        expect(isPageTitleMatch('integrations', 'EDR Integrations')).toBe(true);
    });

    it('does not match a section-level query whose words are absent from the title', () => {
        expect(isPageTitleMatch('selecting crowdstrike URL', 'EDR Integrations')).toBe(false);
    });

    it('does not match when only some query words are in the title', () => {
        expect(isPageTitleMatch('EDR onboarding guide', 'EDR Integrations')).toBe(false);
    });

    it('returns false for an empty query', () => {
        expect(isPageTitleMatch('   ', 'EDR Integrations')).toBe(false);
    });
});
