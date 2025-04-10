import { describe, expect, it, mock } from 'bun:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { withCacheKey, withoutConcurrentExecution } from './memoize';

describe('withoutConcurrentExecution', () => {
    it('should memoize the function based on the cache key', async () => {
        const fn = mock(async (_cacheKey: string, a: number, b: number) => a + b);
        const memoized = withoutConcurrentExecution(() => null, fn);

        const p1 = memoized('c1', 1, 2);
        const p2 = memoized('c1', 1, 2);
        const p3 = memoized('c3', 2, 3);

        expect(await p1).toBe(await p2);
        expect(await p1).not.toBe(await p3);
        expect(fn.mock.calls.length).toBe(2);
    });

    it('should support caching per request', async () => {
        const fn = mock(async () => Math.random());

        const request1 = { id: 'request1' };
        const request2 = { id: 'request2' };

        const requestContext = new AsyncLocalStorage<{ id: string }>();

        const memoized = withoutConcurrentExecution(() => requestContext.getStore(), fn);

        // Both in the same request
        const promise1 = requestContext.run(request1, () => memoized('c1'));
        const promise2 = requestContext.run(request1, () => memoized('c1'));

        // In a different request
        const promise3 = requestContext.run(request2, () => memoized('c1'));

        expect(await promise1).toBe(await promise2);
        expect(await promise1).not.toBe(await promise3);
        expect(fn.mock.calls.length).toBe(2);
    });
});

describe('withCacheKey', () => {
    it('should wrap the function by passing the cache key', async () => {
        const fn = mock(
            async (cacheKey: string, arg: { a: number; b: number }, c: number) =>
                `${cacheKey}, result=${arg.a + arg.b + c}`
        );
        const memoized = withCacheKey(fn);
        expect(await memoized({ a: 1, b: 2 }, 4)).toBe('[[["a",1],["b",2]],4], result=7');
        expect(fn.mock.calls.length).toBe(1);
    });
});
