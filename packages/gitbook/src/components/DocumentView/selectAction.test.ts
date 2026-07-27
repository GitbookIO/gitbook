import { describe, expect, it } from 'bun:test';
import type * as api from '@gitbook/api';
import { getSelectAction } from './selectAction';

// The action shapes are cast because the installed @gitbook/api doesn't type the select variant yet.
const data = (value: unknown) => value as api.DocumentInlineButton['data'];

describe('getSelectAction', () => {
    it('returns the action for a select button', () => {
        expect(getSelectAction(data({ action: { action: 'select', value: 'Python' } }))).toEqual({
            action: 'select',
            value: 'Python',
        });
    });

    it('returns null for ask/search actions', () => {
        expect(getSelectAction(data({ action: { action: 'ask', query: 'hi' } }))).toBeNull();
        expect(getSelectAction(data({ action: { action: 'search' } }))).toBeNull();
    });

    it('returns null for a link (ref) button', () => {
        expect(getSelectAction(data({ ref: { kind: 'url', url: 'https://x.dev' } }))).toBeNull();
    });

    it('returns null when the value is missing or not a string', () => {
        expect(getSelectAction(data({ action: { action: 'select' } }))).toBeNull();
        expect(getSelectAction(data({ action: { action: 'select', value: 42 } }))).toBeNull();
    });
});
