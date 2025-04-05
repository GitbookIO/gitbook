import { describe, expect, it, mock } from 'bun:test';
import { AsyncLocalStorage } from 'node:async_hooks';
import { memoize } from './memoize';

describe('memoize', () => {
    it('should memoize the function', async () => {
        const fn = mock(async () => Math.random());
        const memoized = memoize(() => null, fn);
        expect(await memoized()).toBe(await memoized());
    });

    it('should memoize the function with different arguments', async () => {
        const fn = mock(async (_cacheKey: string, a: number, b: number) => a + b);
        const memoized = memoize(() => null, fn);
        expect(await memoized(1, 2)).toBe(await memoized(1, 2));
        expect(fn.mock.calls.length).toBe(1);
        expect(await memoized(1, 2)).not.toBe(await memoized(2, 3));
        expect(fn.mock.calls.length).toBe(2);
    });

    it('should memoize a function complex object', async () => {
        const fn = mock(
            async (_cacheKey: string, a: { foo: string; bar: number }) => a.foo + a.bar
        );
        const memoized = memoize(() => null, fn);
        expect(await memoized({ foo: 'foo', bar: 1 })).toBe(await memoized({ foo: 'foo', bar: 1 }));
        expect(fn.mock.calls.length).toBe(1);
        expect(await memoized({ foo: 'foo', bar: 1 })).not.toBe(
            await memoized({ foo: 'foo', bar: 2 })
        );
        expect(fn.mock.calls.length).toBe(2);
    });

    it('should wrap concurrent async calls', async () => {
        const fn = mock(async () => Math.random());
        const memoized = memoize(() => null, fn);
        const promise1 = memoized();
        const promise2 = memoized();
        expect(await promise1).toBe(await promise2);
        expect(fn.mock.calls.length).toBe(1);
    });

    it('should pass the cache key to the function', async () => {
        const fn = mock(
            async (cacheKey: string, arg: { a: number; b: number }, c: number) =>
                `${cacheKey}, result=${arg.a + arg.b + c}`
        );
        const memoized = memoize(() => null, fn);
        expect(await memoized({ a: 1, b: 2 }, 4)).toBe('[[["a",1],["b",2]],4], result=7');
        expect(fn.mock.calls.length).toBe(1);
    });

    it('should support caching per request', async () => {
        const fn = mock(async () => Math.random());

        const request1 = { id: 'request1' };
        const request2 = { id: 'request2' };

        const requestContext = new AsyncLocalStorage<{ id: string }>();

        const memoized = memoize(() => requestContext.getStore(), fn);

        // Both in the same request
        const promise1 = requestContext.run(request1, () => memoized());
        const promise2 = requestContext.run(request1, () => memoized());

        // In a different request
        const promise3 = requestContext.run(request2, () => memoized());

        expect(await promise1).toBe(await promise2);
        expect(await promise1).not.toBe(await promise3);
        expect(fn.mock.calls.length).toBe(2);
    });
});
