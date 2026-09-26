import { describe, expect, it } from 'bun:test';

import {
    getScrollOffsetToCenter,
    isElementVisibleInContainer,
    resolveActiveItem,
} from './scrollIntoContainer';

/**
 * A vertical container 100px tall whose content overflows, positioned at the top of the
 * viewport. Values mirror what `getBoundingClientRect()` / `clientHeight` would report.
 */
function container({ scrollTop = 0 }: { scrollTop?: number } = {}) {
    return {
        rect: { top: 0, left: 0 },
        clientHeight: 100,
        clientWidth: 100,
        scrollTop,
        scrollLeft: 0,
    };
}

/** An item of the given height, positioned `top` pixels from the viewport origin. */
function item({ top, height = 20 }: { top: number; height?: number }) {
    return { top, left: 0, height, width: 20 };
}

describe('isElementVisibleInContainer', () => {
    it('reports a fully visible item as visible', () => {
        expect(isElementVisibleInContainer(item({ top: 40 }), container())).toBe(true);
    });

    it('reports an item below the visible region as not visible', () => {
        // The case from the issue: the active item sits far below the container's
        // visible region because the sidebar kept its previous scroll position.
        expect(isElementVisibleInContainer(item({ top: 817 }), container())).toBe(false);
    });

    it('reports an item above the visible region as not visible', () => {
        expect(isElementVisibleInContainer(item({ top: -30 }), container())).toBe(false);
    });

    it('reports an item clipped by the bottom edge as not visible', () => {
        // Its top is inside the container but its bottom half is cut off.
        expect(isElementVisibleInContainer(item({ top: 90, height: 20 }), container())).toBe(false);
    });

    it('treats an item flush with the edges as visible', () => {
        expect(isElementVisibleInContainer(item({ top: 0 }), container())).toBe(true);
        expect(isElementVisibleInContainer(item({ top: 80 }), container())).toBe(true);
    });

    it('measures against the container box, not the viewport', () => {
        // A container offset down the page: an item at the viewport top is above it.
        const offset = { ...container(), rect: { top: 200, left: 0 } };
        expect(isElementVisibleInContainer(item({ top: 40 }), offset)).toBe(false);
        expect(isElementVisibleInContainer(item({ top: 240 }), offset)).toBe(true);
    });
});

describe('getScrollOffsetToCenter', () => {
    it('centers an item that is below the visible region', () => {
        // 0 (scrollTop) + 817 (relative top) - 50 (half container) + 10 (half item)
        expect(getScrollOffsetToCenter(item({ top: 817 }), container())).toEqual({
            top: 777,
            left: -40,
        });
    });

    it('accounts for the container current scroll position', () => {
        expect(getScrollOffsetToCenter(item({ top: 817 }), container({ scrollTop: 200 }))).toEqual({
            top: 977,
            left: -40,
        });
    });
});

/** A stand-in for a DOM node, tracking which container it belongs to. */
type Node = { name: string; contains: (other: Node) => boolean };

/**
 * A container holding `items`, of which the one named `activeName` carries `data-active`.
 * `querySelector` mimics the DOM by returning the first match in document order.
 */
function tree(items: string[], activeName: string | null) {
    const nodes = new Map(items.map((name) => [name, { name, contains: () => false }]));
    const active = (activeName ? nodes.get(activeName) : null) ?? null;
    const root: Node & { querySelector: (selector: string) => Node | null } = {
        name: 'container',
        contains: (other) => nodes.get(other.name) === other,
        querySelector: (selector) => (selector === '[data-active=true]' ? active : null),
    };
    return { root, node: (name: string) => nodes.get(name) ?? null };
}

describe('resolveActiveItem', () => {
    it('resolves the item matching a selector', () => {
        const { root, node } = tree(['intro', 'setup'], 'setup');
        expect(resolveActiveItem('[data-active=true]', root)).toBe(node('setup'));
    });

    it('resolves a different item once another page becomes active', () => {
        // The regression: the sidebar stays mounted across a client-side navigation, so the
        // only signal that it should scroll again is the selector matching another item.
        const before = tree(['intro', 'setup'], 'intro');
        const after = tree(['intro', 'setup'], 'setup');

        const first = resolveActiveItem('[data-active=true]', before.root);
        const second = resolveActiveItem('[data-active=true]', after.root);

        expect(first).toBe(before.node('intro'));
        expect(second).toBe(after.node('setup'));
        expect(second).not.toBe(first);
    });

    it('returns null when no item is active', () => {
        const { root } = tree(['intro', 'setup'], null);
        expect(resolveActiveItem('[data-active=true]', root)).toBeNull();
    });

    it('resolves the item held by a ref', () => {
        const { root, node } = tree(['intro'], null);
        expect(resolveActiveItem({ current: node('intro') }, root)).toBe(node('intro'));
        expect(resolveActiveItem({ current: null }, root)).toBeNull();
    });

    it('ignores an item that is not inside the container', () => {
        // Scrolling to an item of another container would move this one to an arbitrary offset.
        const { root } = tree(['intro'], null);
        const foreign = { name: 'intro', contains: () => false };
        expect(resolveActiveItem({ current: foreign }, root)).toBeNull();
    });
});
