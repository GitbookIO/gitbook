import { beforeEach, describe, expect, it } from 'bun:test';
import { SELECT_STORAGE_KEY } from './constants';

// Own file, own module instance: the store hydrates once per page load, so the "mutation before
// init()" path can only be exercised on a store nothing has touched yet.
const storage = new Map<string, string>();

beforeEach(() => {
    storage.clear();
    (globalThis as unknown as { localStorage: unknown }).localStorage = {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
            storage.set(key, value);
        },
        removeItem: (key: string) => {
            storage.delete(key);
        },
    };
});

describe('select store hydration', () => {
    it('merges a mutation that lands before init() into the stored list', async () => {
        storage.set(SELECT_STORAGE_KEY, JSON.stringify(['go', 'rust']));

        // Query string busts the module cache so this store is untouched by the sibling suite; the
        // specifier is held in a variable because TS won't resolve it as a literal.
        const freshStore = './store?hydration';
        const { activate, getState, init } = (await import(freshStore)) as typeof import('./store');

        // A deep-linked pane activating during hydration, ahead of the provider's init effect.
        activate('python');
        expect(getState().slugs).toEqual(['python', 'go', 'rust']);
        expect(JSON.parse(storage.get(SELECT_STORAGE_KEY) as string)).toEqual([
            'python',
            'go',
            'rust',
        ]);

        // The later init() must not resurrect the pre-mutation list.
        init();
        expect(getState().slugs).toEqual(['python', 'go', 'rust']);
    });
});
