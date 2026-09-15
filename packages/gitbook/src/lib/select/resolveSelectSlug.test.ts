import { describe, expect, it } from 'bun:test';

import { resolveSelectSlug } from './slug';

// Mirrors packages/doc-core/src/select/__tests__/resolveSelectSlug.test.ts in the gitbook-x repo, so
// a tab resolves to the same slug in the editor preview as it does on the published site.
describe('resolveSelectSlug', () => {
    it('prefers an explicit slug over the title', () => {
        expect(resolveSelectSlug({ slug: 'macos', title: 'macOS 15' })).toBe('macos');
    });

    it('slugifies an explicit slug, since it reaches CSS selectors and stored state', () => {
        expect(resolveSelectSlug({ slug: 'On Prem!', title: 'Self hosted' })).toBe('on-prem');
    });

    it('derives from the title when no slug is set', () => {
        expect(resolveSelectSlug({ title: 'macOS 15' })).toBe('macos-15');
    });

    it('keeps titles syncing across a site: same title, same slug', () => {
        expect(resolveSelectSlug({ title: 'macOS' })).toBe(resolveSelectSlug({ title: 'macOS' }));
    });

    it('falls back to the title when the slug is empty or unaddressable', () => {
        expect(resolveSelectSlug({ slug: '', title: 'Windows' })).toBe('windows');
        // An emoji-only slug reduces to nothing, which means "not set", not "clear the slug".
        expect(resolveSelectSlug({ slug: '🎉', title: 'Windows' })).toBe('windows');
    });

    it('returns an empty slug when neither field is addressable', () => {
        expect(resolveSelectSlug({})).toBe('');
        expect(resolveSelectSlug({ title: '🎉' })).toBe('');
        expect(resolveSelectSlug({ slug: '🎉', title: '🎉' })).toBe('');
    });

    it('is idempotent, so a resolved slug can be fed back in', () => {
        const once = resolveSelectSlug({ title: 'macOS 15' });
        expect(resolveSelectSlug({ slug: once })).toBe(once);
    });
});
