import { describe, expect, it } from 'bun:test';

import { resolveDynamicBinding } from './dynamic';

const state = { name: 'Nolann', count: 3, missing: undefined };

describe('resolveDynamicBinding', () => {
    it('resolves a binding against the state', () => {
        expect(
            resolveDynamicBinding<Record<string, unknown>>(state, { label: { $state: 'name' } })
        ).toEqual({ label: 'Nolann' });
    });

    it('resolves bindings nested in arrays', () => {
        expect(
            resolveDynamicBinding<Record<string, unknown>>(state, {
                items: [{ $state: 'count' }, 'x'],
            })
        ).toEqual({ items: [3, 'x'] });
    });

    it('passes primitives through', () => {
        expect(resolveDynamicBinding(state, 'text')).toEqual('text');
        expect(resolveDynamicBinding(state, 42)).toEqual(42);
        expect(resolveDynamicBinding(state, false)).toEqual(false);
        expect(resolveDynamicBinding(state, { a: undefined })).toEqual({ a: undefined });
    });

    // Webframes post arbitrary JSON, so `null` is common and used to throw on the `in` check.
    it('passes null through, at any depth', () => {
        expect(resolveDynamicBinding(state, { action: 'foo', data: null })).toEqual({
            action: 'foo',
            data: null,
        });
        expect(resolveDynamicBinding(state, { items: [1, null] })).toEqual({ items: [1, null] });
    });

    // A structured clone carries real Date instances; walking their entries would yield `{}`.
    it('leaves class instances intact', () => {
        const date = new Date('2020-01-01');
        expect(resolveDynamicBinding(state, { at: date })).toEqual({ at: date });
    });

    it('leaves an action without any binding unchanged', () => {
        const action = { action: 'my.custom.action', props: { a: 1, b: ['x'] } };
        expect(resolveDynamicBinding(state, action)).toEqual(action);
    });
});
