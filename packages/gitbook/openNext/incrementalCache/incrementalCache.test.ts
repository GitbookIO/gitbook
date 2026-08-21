import { afterEach, describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';

import { DEFAULT_PREFIX, GitbookIncrementalCache } from './incrementalCache';

const environmentKeys = ['OPEN_NEXT_BUILD_ID', 'DEPLOYMENT_ID', 'NEXT_BUILD_ID'] as const;
const originalEnvironment = Object.fromEntries(
    environmentKeys.map((key) => [key, process.env[key]])
);

const hash = (key: string) => createHash('sha256').update(key).digest('hex');

afterEach(() => {
    for (const key of environmentKeys) {
        const value = originalEnvironment[key];
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
});

describe('GitbookIncrementalCache cache keys', () => {
    it('uses the deployment-aware OpenNext build ID', () => {
        process.env.OPEN_NEXT_BUILD_ID = 'deployment-id';
        process.env.NEXT_BUILD_ID = 'legacy-build-id';

        expect(new GitbookIncrementalCache().getR2Key('entry')).toBe(
            `${DEFAULT_PREFIX}/deployment-id/${hash('entry')}.cache`
        );
    });

    it('uses the Cloudflare deployment ID when the worker build ID is unavailable', () => {
        delete process.env.OPEN_NEXT_BUILD_ID;
        process.env.DEPLOYMENT_ID = 'runtime-deployment-id';

        expect(new GitbookIncrementalCache().getR2Key('entry')).toBe(
            `${DEFAULT_PREFIX}/runtime-deployment-id/${hash('entry')}.cache`
        );
    });

    it('normalizes composable cache keys before applying the deployment namespace', () => {
        process.env.OPEN_NEXT_BUILD_ID = 'deployment-id';
        const key = JSON.stringify(['next-build-id', 'cache-key']);

        expect(new GitbookIncrementalCache().getR2Key(key, 'composable')).toBe(
            `${DEFAULT_PREFIX}/dataCache/${hash(JSON.stringify(['cache-key']))}.composable`
        );
    });
});
