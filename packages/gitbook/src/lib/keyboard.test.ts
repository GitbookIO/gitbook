import { describe, expect, it } from 'bun:test';

import { isComposingKeyEvent } from './keyboard';

describe('isComposingKeyEvent', () => {
    it('is false for a regular Enter', () => {
        expect(isComposingKeyEvent({ nativeEvent: { isComposing: false, keyCode: 13 } })).toBe(
            false
        );
    });

    it('is true while composing', () => {
        expect(isComposingKeyEvent({ nativeEvent: { isComposing: true, keyCode: 13 } })).toBe(true);
    });

    it('is true for the Safari confirming keydown', () => {
        expect(isComposingKeyEvent({ nativeEvent: { isComposing: false, keyCode: 229 } })).toBe(
            true
        );
    });
});
