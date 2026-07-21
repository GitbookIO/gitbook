import { afterEach, describe, expect, it } from 'bun:test';
import { SELECT_LIST_CAP, SELECT_STORAGE_KEY, SELECT_URL_PARAM } from '@/lib/select';
import { applySelectStateScript } from './script';

// Exercises the exact function that ships in the <head> pre-paint script, against a mocked DOM.
let attributes: Record<string, string>;
let storage: Record<string, string>;

function setup(search: string, stored?: string[]) {
    attributes = {};
    storage = {};
    if (stored) {
        storage[SELECT_STORAGE_KEY] = JSON.stringify(stored);
    }
    // biome-ignore lint/suspicious/noExplicitAny: minimal DOM/window stubs for the pre-paint script
    (globalThis as any).document = {
        documentElement: {
            setAttribute: (key: string, value: string) => {
                attributes[key] = value;
            },
            removeAttribute: (key: string) => {
                delete attributes[key];
            },
        },
    };
    // biome-ignore lint/suspicious/noExplicitAny: minimal DOM/window stubs for the pre-paint script
    (globalThis as any).window = {
        location: { search },
        localStorage: {
            getItem: (key: string) => (key in storage ? storage[key] : null),
            setItem: (key: string, value: string) => {
                storage[key] = value;
            },
        },
    };
}

function run() {
    applySelectStateScript(SELECT_STORAGE_KEY, SELECT_URL_PARAM, SELECT_LIST_CAP);
}

afterEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: clean up global stubs
    (globalThis as any).document = undefined;
    // biome-ignore lint/suspicious/noExplicitAny: clean up global stubs
    (globalThis as any).window = undefined;
});

describe('applySelectStateScript', () => {
    it('prepends URL slugs onto stored ones and writes <html> rank attributes', () => {
        setup('?select=go,python', ['python', 'java']);
        run();
        expect(attributes['data-sel-0']).toBe('go');
        expect(attributes['data-sel-1']).toBe('python');
        expect(attributes['data-sel-2']).toBe('java');
        // The merged, deduped list is persisted so the in-memory store adopts it on init.
        expect(JSON.parse(storage[SELECT_STORAGE_KEY] ?? 'null')).toEqual(['go', 'python', 'java']);
    });

    it('applies stored state when there is no URL param', () => {
        setup('', ['python']);
        run();
        expect(attributes['data-sel-0']).toBe('python');
        expect(attributes['data-sel-1']).toBeUndefined();
    });

    it('writes nothing when there is no selection', () => {
        setup('', undefined);
        run();
        expect(attributes['data-sel-0']).toBeUndefined();
        expect(JSON.parse(storage[SELECT_STORAGE_KEY] ?? 'null')).toEqual([]);
    });

    it('caps the applied list', () => {
        const many = Array.from({ length: SELECT_LIST_CAP + 4 }, (_, i) => `s${i}`);
        setup(`?select=${many.join(',')}`);
        run();
        expect(attributes[`data-sel-${SELECT_LIST_CAP - 1}`]).toBeDefined();
        expect(attributes[`data-sel-${SELECT_LIST_CAP}`]).toBeUndefined();
    });
});
