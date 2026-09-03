import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { scrollByItemsInContainer } from './ScrollContainer';

type MockRect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
};

class MockElement {
    constructor(private readonly rect: MockRect) {}

    getBoundingClientRect() {
        return this.rect;
    }
}

const originalHTMLElement = globalThis.HTMLElement;

beforeAll(() => {
    Object.defineProperty(globalThis, 'HTMLElement', {
        configurable: true,
        value: MockElement,
    });
});

afterAll(() => {
    Object.defineProperty(globalThis, 'HTMLElement', {
        configurable: true,
        value: originalHTMLElement,
    });
});

function rect(left: number, right: number): MockRect {
    return { left, right, top: 0, bottom: 100, width: right - left, height: 100 };
}

function makeContainer(
    childRects: MockRect[],
    options: { scrollLeft?: number; scrollWidth?: number } = {}
) {
    const scrollCalls: Record<string, unknown>[] = [];
    const container = Object.assign(new MockElement(rect(0, 300)), {
        children: childRects.map((childRect) => new MockElement(childRect)),
        clientHeight: 100,
        clientWidth: 300,
        scrollHeight: 100,
        scrollLeft: options.scrollLeft ?? 0,
        scrollTop: 0,
        scrollWidth: options.scrollWidth ?? 1000,
        scrollTo: (options: Record<string, unknown>) => scrollCalls.push(options),
    });

    return { container: container as unknown as HTMLElement, scrollCalls };
}

describe('scrollByItemsInContainer', () => {
    it('advances by fully visible items and excludes a partial preview', () => {
        const { container, scrollCalls } = makeContainer([
            rect(0, 100),
            rect(110, 210),
            rect(220, 320),
            rect(330, 430),
        ]);

        scrollByItemsInContainer(container, 'horizontal', 'forward');

        expect(scrollCalls).toEqual([{ top: undefined, left: 220, behavior: 'smooth' }]);
    });

    it('moves backward by the visible page size', () => {
        const { container, scrollCalls } = makeContainer(
            [rect(-220, -120), rect(-110, -10), rect(0, 100), rect(110, 210), rect(220, 320)],
            { scrollLeft: 220 }
        );

        scrollByItemsInContainer(container, 'horizontal', 'backward');

        expect(scrollCalls).toEqual([{ top: undefined, left: 0, behavior: 'smooth' }]);
    });

    it('clamps at the first and last scroll positions', () => {
        const firstPage = makeContainer([rect(0, 100), rect(110, 210), rect(220, 320)]);
        scrollByItemsInContainer(firstPage.container, 'horizontal', 'backward');

        const lastPage = makeContainer(
            [rect(-240, -140), rect(-130, -30), rect(-20, 80), rect(90, 190), rect(200, 300)],
            { scrollLeft: 240, scrollWidth: 540 }
        );
        scrollByItemsInContainer(lastPage.container, 'horizontal', 'forward');

        expect(firstPage.scrollCalls).toEqual([{ top: undefined, left: 0, behavior: 'smooth' }]);
        expect(lastPage.scrollCalls).toEqual([{ top: undefined, left: 240, behavior: 'smooth' }]);
    });
});
