import { describe, expect, it } from 'bun:test';

import { resolveAnchorURL } from './urls';

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
