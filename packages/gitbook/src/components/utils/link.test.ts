import { describe, expect, it } from 'bun:test';

import { isExternalLink } from './link';

describe('isExternalLink', () => {
    it('treats anchor links as internal', () => {
        expect(isExternalLink('#section')).toBe(false);
    });

    it('treats relative links as internal', () => {
        expect(isExternalLink('/docs')).toBe(false);
        expect(isExternalLink('docs/getting-started')).toBe(false);
    });

    it('treats absolute links as external when no origin is provided', () => {
        expect(isExternalLink('https://example.com/docs')).toBe(true);
    });

    it('treats links from a different origin as external', () => {
        expect(isExternalLink('https://other.com/docs', 'https://example.com')).toBe(true);
    });

    it('treats links from the same origin as internal', () => {
        expect(isExternalLink('https://example.com/docs', 'https://example.com')).toBe(false);
        expect(isExternalLink('https://example.com/', 'https://example.com')).toBe(false);
    });

    it('handles proxy origins with a pathname prefix', () => {
        expect(isExternalLink('https://gitbook.com/docs/page', 'https://gitbook.com/docs')).toBe(
            false
        );
        expect(isExternalLink('https://gitbook.com/docs/', 'https://gitbook.com/docs')).toBe(false);
        expect(isExternalLink('https://gitbook.com/docs', 'https://gitbook.com/docs')).toBe(false);
        expect(isExternalLink('https://gitbook.com/docs-x', 'https://gitbook.com/docs')).toBe(true);
    });

    it('falls back to the legacy quick check when URL.canParse is unavailable', () => {
        const originalCanParse = URL.canParse;

        Object.defineProperty(URL, 'canParse', {
            value: undefined,
            configurable: true,
        });

        try {
            expect(isExternalLink('http://example.com')).toBe(true);
            expect(isExternalLink('https://example.com')).toBe(true);
            expect(isExternalLink('/docs')).toBe(false);
        } finally {
            Object.defineProperty(URL, 'canParse', {
                value: originalCanParse,
                configurable: true,
            });
        }
    });
});
