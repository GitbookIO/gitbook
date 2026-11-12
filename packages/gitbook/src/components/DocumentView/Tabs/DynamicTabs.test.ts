import { describe, expect, it } from 'bun:test';

import { getNextTabIndex } from './DynamicTabs';

describe('getNextTabIndex', () => {
    it('moves with the arrow keys and wraps around', () => {
        expect(getNextTabIndex('ArrowRight', 0, 3)).toBe(1);
        expect(getNextTabIndex('ArrowRight', 2, 3)).toBe(0);
        expect(getNextTabIndex('ArrowLeft', 0, 3)).toBe(2);
    });

    it('jumps to the first and last tab', () => {
        expect(getNextTabIndex('Home', 2, 3)).toBe(0);
        expect(getNextTabIndex('End', 0, 3)).toBe(2);
    });

    it('mirrors the arrows in right-to-left', () => {
        expect(getNextTabIndex('ArrowLeft', 0, 3, true)).toBe(1);
        expect(getNextTabIndex('ArrowRight', 0, 3, true)).toBe(2);
    });

    it('ignores other keys and an unknown tab', () => {
        expect(getNextTabIndex('Enter', 0, 3)).toBeNull();
        expect(getNextTabIndex('ArrowRight', -1, 3)).toBeNull();
    });
});
