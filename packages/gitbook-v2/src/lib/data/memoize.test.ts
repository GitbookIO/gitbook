import { describe, expect, it, mock } from 'bun:test';
import { memoize } from './memoize';

describe('memoize', () => {
    it('should memoize the function', () => {
        const fn = mock(() => Math.random());
        const memoized = memoize(fn);
        expect(memoized()).toBe(memoized());
    });

    it('should memoize the function with different arguments', () => {
        const fn = mock((a: number, b: number) => a + b);
        const memoized = memoize(fn);
        expect(memoized(1, 2)).toBe(memoized(1, 2));
        expect(fn.mock.calls.length).toBe(1);
        expect(memoized(1, 2)).not.toBe(memoized(2, 3));
        expect(fn.mock.calls.length).toBe(2);
    });

    it('should memoize a function complex object', () => {
        const fn = mock((a: { foo: string; bar: number }) => a.foo + a.bar);
        const memoized = memoize(fn);
        expect(memoized({ foo: 'foo', bar: 1 })).toBe(memoized({ foo: 'foo', bar: 1 }));
        expect(fn.mock.calls.length).toBe(1);
        expect(memoized({ foo: 'foo', bar: 1 })).not.toBe(memoized({ foo: 'foo', bar: 2 }));
        expect(fn.mock.calls.length).toBe(2);
    });

    it('should support async function', async () => {
        const fn = mock(async () => Math.random());
        const memoized = memoize(fn);
        expect(await memoized()).toBe(await memoized());
    });

    it('should wrap concurrent async calls', async () => {
        const fn = mock(async () => Math.random());
        const memoized = memoize(fn);
        const promise1 = memoized();
        const promise2 = memoized();
        expect(await promise1).toBe(await promise2);
        expect(fn.mock.calls.length).toBe(1);
    });
});
