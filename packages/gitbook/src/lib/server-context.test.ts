import { describe, expect, it, mock } from 'bun:test';
import {
    type WorkStore,
    workAsyncStorage,
} from 'next/dist/server/app-render/work-async-storage.external';

mock.module('server-only', () => ({}));

const { createServerContextValue, serverCache } = await import('./server-context');

/** Run `fn` the way Next runs a request: under a work store of its own. */
function inRequest<T>(fn: () => T): T {
    return workAsyncStorage.run({} as WorkStore, fn);
}

describe('createServerContextValue', () => {
    it('provides a value to the rest of the request, first one wins', () => {
        const value = createServerContextValue<string>('first-wins');

        inRequest(() => {
            expect(value.read()).toBeUndefined();
            value.provide('first');
            value.provide('second');
            expect(value.read()).toBe('first');
        });
    });

    it('isolates requests from each other', () => {
        const value = createServerContextValue<string>('isolated');

        inRequest(() => value.provide('a'));
        inRequest(() => expect(value.read()).toBeUndefined());
    });

    it('is inert outside a request', () => {
        const value = createServerContextValue<string>('inert');

        value.provide('a');
        expect(value.read()).toBeUndefined();
    });
});

describe('serverCache', () => {
    it('memoizes calls within a request, non-primitive arguments included', () => {
        const fn = mock((input: { id: string }) => ({ id: input.id }));
        const cached = serverCache(fn);

        inRequest(() => {
            const first = cached({ id: 'a' });
            expect(cached({ id: 'a' })).toBe(first);
            expect(cached({ id: 'b' })).not.toBe(first);
        });
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not share results across requests', () => {
        const fn = mock(() => ({}));
        const cached = serverCache(fn);

        const first = inRequest(() => cached());
        const second = inRequest(() => cached());
        expect(second).not.toBe(first);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not memoize outside a request', () => {
        const fn = mock(() => ({}));
        const cached = serverCache(fn);

        expect(cached()).not.toBe(cached());
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('keeps functions with the same source apart', () => {
        const a = serverCache(() => 'a');
        const b = serverCache(() => 'b');

        inRequest(() => {
            expect(a()).toBe('a');
            expect(b()).toBe('b');
        });
    });
});
