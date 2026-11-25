import { describe, expect, it } from 'bun:test';

import { createPlanStats, markPlanStart, recordCall, summarizePlanStats } from './plan-stats';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
        resolve = r;
    });
    return { promise, resolve };
}

function clock() {
    let now = 0;
    return {
        now: () => now,
        set: (value: number) => {
            now = value;
        },
    };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('plan stats', () => {
    it('counts the head start when the render asks before the plan call settles', async () => {
        const c = clock();
        const stats = createPlanStats(c.now);
        const call = deferred();
        recordCall(stats, 'getRevisionPageDocument', { pageId: 'p' }, call.promise, true);
        c.set(60);
        recordCall(stats, 'getRevisionPageDocument', { pageId: 'p' }, call.promise, false);
        c.set(100);
        call.resolve();
        await flush();

        const summary = summarizePlanStats(stats);
        expect(summary.used).toBe(1);
        expect(summary.savedMsMax).toBe(60);
        expect(summary.savedMsTotal).toBe(60);
    });

    it('counts the whole duration when the plan call settled before the render asked', async () => {
        const c = clock();
        const stats = createPlanStats(c.now);
        const call = deferred();
        recordCall(stats, 'getEmbedByUrl', { url: 'u' }, call.promise, true);
        c.set(50);
        call.resolve();
        await flush();
        c.set(200);
        recordCall(stats, 'getEmbedByUrl', { url: 'u' }, call.promise, false);

        expect(summarizePlanStats(stats).savedMsMax).toBe(50);
    });

    it('matches calls by method and argument shape', async () => {
        const stats = createPlanStats(() => 0);
        const call = Promise.resolve();
        recordCall(stats, 'getSpace', { spaceId: 's', shareKey: undefined }, call, true);
        recordCall(stats, 'getSpace', { shareKey: undefined, spaceId: 's' }, call, false);
        recordCall(stats, 'getRevision', { spaceId: 's' }, call, false);
        await flush();

        const summary = summarizePlanStats(stats);
        expect(summary.used).toBe(1);
        expect(summary.notPlanned).toEqual({
            getRevision: { count: 1, maxMs: 0, example: { spaceId: 's' } },
        });
    });

    it('reports plan calls the render never made as wasted', async () => {
        const stats = createPlanStats(() => 0);
        recordCall(stats, 'getImageSize', ['https://x', { dpr: 2 }], Promise.resolve(), true);
        await flush();

        const summary = summarizePlanStats(stats);
        expect(summary.wasted).toEqual({ getImageSize: 1 });
        expect(summary.used).toBe(0);
    });

    it('measures rejected calls too', async () => {
        const c = clock();
        const stats = createPlanStats(c.now);
        const call = Promise.reject(new Error('boom'));
        recordCall(stats, 'getRevision', { spaceId: 's' }, call, false);
        call.catch(() => {});
        c.set(30);
        await flush();

        expect(summarizePlanStats(stats).notPlanned).toEqual({
            getRevision: { count: 1, maxMs: 30, example: { spaceId: 's' } },
        });
    });

    it('only reports render calls made after the plan began as not planned', async () => {
        const c = clock();
        const stats = createPlanStats(c.now);
        recordCall(stats, 'getPublishedContentSite', { siteId: 's' }, Promise.resolve(), false);
        c.set(10);
        markPlanStart(stats);
        c.set(20);
        recordCall(stats, 'getRevisionPageByPath', { path: 'p' }, Promise.resolve(), false);
        await flush();

        const summary = summarizePlanStats(stats);
        expect(summary.beforePlan).toBe(1);
        expect(Object.keys(summary.notPlanned)).toEqual(['getRevisionPageByPath']);
    });

    it('keeps only ids in the example of a not planned call', async () => {
        const stats = createPlanStats(() => 0);
        recordCall(
            stats,
            'getSpace',
            { spaceId: 's', shareKey: 'secret', extra: { deep: true } },
            Promise.resolve(),
            false
        );
        await flush();

        expect(summarizePlanStats(stats).notPlanned.getSpace?.example).toEqual({ spaceId: 's' });
    });
});
