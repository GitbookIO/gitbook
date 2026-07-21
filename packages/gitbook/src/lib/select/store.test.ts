import { beforeEach, describe, expect, it } from 'bun:test';
import { SELECT_LIST_CAP } from './constants';
import { activate, deactivate, getState, resolveActiveSlug, setSlugs, subscribe } from './store';

beforeEach(() => {
    setSlugs([]);
});

describe('select store', () => {
    it('activates slugs most-recent-first', () => {
        activate('python');
        activate('cloud');
        expect(getState().slugs).toEqual(['cloud', 'python']);
    });

    it('moves an already-active slug back to the front', () => {
        setSlugs(['go', 'python', 'cloud']);
        activate('cloud');
        expect(getState().slugs).toEqual(['cloud', 'go', 'python']);
    });

    it('dedupes and drops empty slugs', () => {
        setSlugs(['python', '', 'python', 'go']);
        expect(getState().slugs).toEqual(['python', 'go']);
    });

    it('caps the list and evicts the oldest', () => {
        const many = Array.from({ length: SELECT_LIST_CAP + 5 }, (_, i) => `s${i}`);
        setSlugs(many);
        expect(getState().slugs).toHaveLength(SELECT_LIST_CAP);
        expect(getState().slugs).toEqual(many.slice(0, SELECT_LIST_CAP));
    });

    it('deactivates a slug', () => {
        setSlugs(['python', 'cloud']);
        deactivate('python');
        expect(getState().slugs).toEqual(['cloud']);
    });

    describe('resolveActiveSlug', () => {
        it('returns the most recently active candidate', () => {
            setSlugs(['cloud', 'python', 'go']);
            expect(resolveActiveSlug(['go', 'python'])).toBe('python');
        });

        it('returns null when no candidate is active', () => {
            setSlugs(['cloud']);
            expect(resolveActiveSlug(['python', 'go'])).toBeNull();
        });
    });

    describe('change notifications', () => {
        it('notifies subscribers on a real change', () => {
            let calls = 0;
            const unsubscribe = subscribe(() => {
                calls++;
            });
            activate('python');
            expect(calls).toBe(1);
            unsubscribe();
        });

        it('does not notify when the list is unchanged (prevents URL mirror loops)', () => {
            setSlugs(['python', 'go']);
            let calls = 0;
            const unsubscribe = subscribe(() => {
                calls++;
            });
            setSlugs(['python', 'go']);
            activate('python'); // already at front → no change
            expect(calls).toBe(0);
            unsubscribe();
        });
    });
});
