import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import {
    clearLastSearchState,
    getLastSearchState,
    resolveSearchValue,
    sanitizeLastSearchState,
    setLastSearchState,
} from './last-query';

const STORAGE_KEY = '@gitbook/searchLastQuery';

describe('resolveSearchValue', () => {
    it('uses URL q before every other value', () => {
        expect(
            resolveSearchValue({ q: 'url q', ask: 'url ask' }, { q: 'stored q', ask: 'stored ask' })
        ).toBe('url q');
    });

    it('uses stored q before URL ask', () => {
        expect(
            resolveSearchValue({ q: null, ask: 'url ask' }, { q: 'stored q', ask: 'stored ask' })
        ).toBe('stored q');
    });

    it('uses URL ask before stored ask', () => {
        expect(
            resolveSearchValue({ q: null, ask: 'url ask' }, { q: null, ask: 'stored ask' })
        ).toBe('url ask');
    });

    it('falls back to stored ask', () => {
        expect(resolveSearchValue({ q: null, ask: null }, { q: null, ask: 'stored ask' })).toBe(
            'stored ask'
        );
    });

    it('treats an empty URL q as an explicit empty value', () => {
        expect(
            resolveSearchValue({ q: '', ask: 'url ask' }, { q: 'stored q', ask: 'stored ask' })
        ).toBe('');
    });
});

describe('sanitizeLastSearchState', () => {
    it('migrates the original string format to q', () => {
        expect(sanitizeLastSearchState({ space: '  migrated query  ' })).toEqual({
            space: { q: 'migrated query', ask: null },
        });
    });

    it('sanitizes q and ask independently', () => {
        expect(
            sanitizeLastSearchState({
                valid: { q: '  query  ', ask: '  question  ' },
                empty: { q: ' ', ask: null },
                invalid: { q: 123, ask: false },
            })
        ).toEqual({
            valid: { q: 'query', ask: 'question' },
        });
    });
});

describe('last search storage', () => {
    const values = new Map<string, string>([
        [STORAGE_KEY, JSON.stringify({ migrated: 'old query' })],
    ]);
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

    beforeAll(() => {
        Object.defineProperty(globalThis, 'window', {
            configurable: true,
            value: globalThis,
        });
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: {
                getItem: (key: string) => values.get(key) ?? null,
                setItem: (key: string, value: string) => values.set(key, value),
            },
        });
    });

    afterAll(() => {
        if (originalWindow) {
            Object.defineProperty(globalThis, 'window', originalWindow);
        } else {
            Reflect.deleteProperty(globalThis, 'window');
        }
        if (originalLocalStorage) {
            Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
        } else {
            Reflect.deleteProperty(globalThis, 'localStorage');
        }
    });

    it('reads the migrated storage format', () => {
        expect(getLastSearchState('migrated')).toEqual({ q: 'old query', ask: null });
    });

    it('stores q and ask independently', () => {
        setLastSearchState('current', { q: 'query', ask: 'question' });

        expect(getLastSearchState('current')).toEqual({ q: 'query', ask: 'question' });
    });

    it('clears the persisted state after selection', () => {
        setLastSearchState('selected', { q: 'query', ask: null });
        clearLastSearchState('selected');

        expect(getLastSearchState('selected')).toEqual({ q: null, ask: null });
    });
});
