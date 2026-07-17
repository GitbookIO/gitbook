import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const getCloudflareContext = mock();
mock.module('@opennextjs/cloudflare', () => ({ getCloudflareContext }));

const { default: tagCache } = await import('./cacheWorkerClient');

describe('GitbookTagCache cache worker client', () => {
    const writeTags = mock();

    beforeEach(() => {
        writeTags.mockReset();
        getCloudflareContext.mockReturnValue({
            env: {
                NEXT_INC_CACHE_WORKER: { writeTags },
            },
        });
    });

    afterEach(() => {
        getCloudflareContext.mockReset();
    });

    it('writes hard tags through the cache worker service binding', async () => {
        writeTags.mockResolvedValue(undefined);

        await tagCache.writeTags([
            'content',
            { tag: 'with-duration', stale: 100, expire: 200 },
            '_N_T_/soft-tag',
        ]);

        expect(writeTags).toHaveBeenCalledWith([
            'content',
            { tag: 'with-duration', stale: 100, expire: 200 },
        ]);
    });

    it('does not call the worker when all tags are soft tags', async () => {
        await tagCache.writeTags(['_N_T_/soft-tag']);

        expect(writeTags).not.toHaveBeenCalled();
    });
});
