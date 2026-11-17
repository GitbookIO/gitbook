import { describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';

import { GitbookIncrementalCache } from './incrementalCache';

describe('GitbookIncrementalCache.getR2Key', () => {
    const cache = new GitbookIncrementalCache();

    it('accepts the hashed composable key passed by OpenNext', () => {
        const storageKey = createHash('sha256').update('["build-id","action",[]]').digest('hex');

        const key = cache.getR2Key(storageKey, 'composable');

        const hash = createHash('sha256').update(storageKey).digest('hex');
        expect(key).toBe(`incremental-cache/dataCache/${hash}.composable`);
    });

    it('maps distinct composable keys to distinct R2 keys', () => {
        expect(cache.getR2Key('a'.repeat(64), 'composable')).not.toBe(
            cache.getR2Key('b'.repeat(64), 'composable')
        );
    });
});
