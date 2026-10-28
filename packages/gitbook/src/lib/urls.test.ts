import { describe, expect, it } from 'bun:test';

import { getSamePageAnchor, resolveAnchorURL } from './urls';

describe('getSamePageAnchor', () => {
    const location = {
        href: 'https://gitbook.com/docs/docs-site/site-settings?mode=preview#current',
    };

    it('resolves a hash-only link', () => {
        expect(getSamePageAnchor('#target', location)).toBe('target');
    });

    it('resolves a same-page path with a hash', () => {
        expect(
            getSamePageAnchor(
                '/docs/docs-site/site-settings?mode=preview#gitbook-subdirectory',
                location
            )
        ).toBe('gitbook-subdirectory');
    });

    it('does not resolve a different page, query, origin, or missing hash', () => {
        expect(getSamePageAnchor('/docs/other#target', location)).toBeNull();
        expect(
            getSamePageAnchor('/docs/docs-site/site-settings?mode=other#target', location)
        ).toBeNull();
        expect(
            getSamePageAnchor('https://example.com/docs/docs-site/site-settings#target', location)
        ).toBeNull();
        expect(
            getSamePageAnchor('/docs/docs-site/site-settings?mode=preview', location)
        ).toBeNull();
    });
});

describe('resolveAnchorURL', () => {
    it('replaces the current location hash with the new anchor', () => {
        expect(
            resolveAnchorURL('#new-anchor', {
                href: 'https://gitbook.com/docs/creating-content/blocks/heading#anchor-links',
            })
        ).toBe('/docs/creating-content/blocks/heading#new-anchor');
    });

    it('preserves URL path and search params when replacing the hash', () => {
        expect(
            resolveAnchorURL('#new-anchor', {
                href: 'https://gitbook.com/docs/creating-content/blocks/heading?fallback=true&query=%74est#anchor-links',
            })
        ).toBe('/docs/creating-content/blocks/heading?fallback=true&query=%74est#new-anchor');
    });
});
