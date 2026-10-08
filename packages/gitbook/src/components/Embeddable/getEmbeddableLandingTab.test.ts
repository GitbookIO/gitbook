import { describe, expect, it } from 'bun:test';

import { getEmbeddableLandingTab } from './getEmbeddableLandingTab';

describe('getEmbeddableLandingTab', () => {
    it('keeps the embed default when nothing is configured', () => {
        expect(getEmbeddableLandingTab({})).toBeNull();
        expect(getEmbeddableLandingTab({ tabs: ['docs', 'search'] })).toBeNull();
    });

    it('opens on the configured tab', () => {
        expect(getEmbeddableLandingTab({ defaultTab: 'search' })).toBe('search');
        expect(
            getEmbeddableLandingTab({ tabs: ['assistant', 'search', 'docs'], defaultTab: 'search' })
        ).toBe('search');
    });

    it('opens on the docs when only a default page is set', () => {
        expect(getEmbeddableLandingTab({ defaultPage: 'getting-started' })).toBe('docs');
    });

    it('prefers the configured tab over the default page', () => {
        expect(
            getEmbeddableLandingTab({ defaultTab: 'assistant', defaultPage: 'getting-started' })
        ).toBe('assistant');
    });

    it('ignores a tab that is not enabled', () => {
        expect(getEmbeddableLandingTab({ tabs: ['assistant'], defaultTab: 'search' })).toBeNull();
        expect(
            getEmbeddableLandingTab({ tabs: ['assistant', 'search'], defaultPage: 'quickstart' })
        ).toBeNull();
    });

    it('ignores an unknown tab', () => {
        // @ts-expect-error - the parent window is plain JS and can send anything.
        expect(getEmbeddableLandingTab({ defaultTab: 'settings' })).toBeNull();
    });
});
