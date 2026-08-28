import type { IncrementalCache } from '@opennextjs/aws/types/overrides.js';
import { describe, expect, it } from 'bun:test';

import { returnNullOn404, with404Guard } from './incrementalCache';

const withValue = (value: any) => ({ value, lastModified: 123 });

describe('returnNullOn404', () => {
    it('returns null for a null entry', () => {
        expect(returnNullOn404(null)).toBeNull();
    });

    it('returns null for a 404 entry', () => {
        expect(
            returnNullOn404(
                withValue({ type: 'app', html: '<html></html>', rsc: 'rsc', meta: { status: 404 } })
            )
        ).toBeNull();
    });

    it('returns the entry for a valid app entry', () => {
        const entry = withValue({
            type: 'app',
            html: '<html></html>',
            rsc: 'rsc',
            meta: { status: 200 },
        });
        expect(returnNullOn404(entry)).toBe(entry);
    });

    it('returns the entry for a redirect entry', () => {
        const entry = withValue({ type: 'redirect', meta: { status: 308 } });
        expect(returnNullOn404(entry)).toBe(entry);
    });
});

describe('with404Guard', () => {
    // Minimal class-based fake so the guard is exercised against prototype methods,
    // like the RegionalCache it wraps in production.
    class FakeCache implements IncrementalCache {
        name = 'FakeCache';
        constructor(private entry: any) {}
        async get(_key: string) {
            return this.entry;
        }
        async set() {}
        async delete() {}
    }

    it('filters out a 404 entry returned by the wrapped cache', async () => {
        const cache = with404Guard(
            new FakeCache(
                withValue({ type: 'app', html: '<html></html>', rsc: 'rsc', meta: { status: 404 } })
            )
        );
        expect(await cache.get('key')).toBeNull();
    });

    it('passes through a valid entry', async () => {
        const entry = withValue({
            type: 'app',
            html: '<html></html>',
            rsc: 'rsc',
            meta: { status: 200 },
        });
        const cache = with404Guard(new FakeCache(entry));
        expect(await cache.get('key')).toBe(entry);
    });
});
