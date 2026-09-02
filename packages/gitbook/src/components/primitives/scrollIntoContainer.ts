/**
 * Geometry helpers for scrolling an item into view inside a scroll container.
 *
 * Kept free of React/DOM imports so the logic can be unit-tested directly.
 */

/** The subset of a `DOMRect` needed to position an element inside a container. */
export type ElementBox = {
    top: number;
    left: number;
    height: number;
    width: number;
};

/** The subset of a scroll container's geometry needed to place one of its items. */
export type ContainerBox = {
    /** The container's own viewport-relative position, as returned by `getBoundingClientRect()`. */
    rect: { top: number; left: number };
    clientHeight: number;
    clientWidth: number;
    scrollTop: number;
    scrollLeft: number;
};

/**
 * Whether an element is fully within the visible region of its scroll container.
 *
 * Both boxes are viewport-relative, so the element's position is compared against the
 * container's own box rather than the viewport.
 */
export function isElementVisibleInContainer(
    element: Pick<ElementBox, 'top' | 'height'>,
    container: Pick<ContainerBox, 'rect' | 'clientHeight'>
): boolean {
    const relativeTop = element.top - container.rect.top;
    return relativeTop >= 0 && relativeTop + element.height <= container.clientHeight;
}

/**
 * The scroll offset that centers an element within its scroll container.
 */
export function getScrollOffsetToCenter(
    element: ElementBox,
    container: ContainerBox
): { top: number; left: number } {
    return {
        top:
            container.scrollTop +
            (element.top - container.rect.top) -
            container.clientHeight / 2 +
            element.height / 2,
        left:
            container.scrollLeft +
            (element.left - container.rect.left) -
            container.clientWidth / 2 +
            element.width / 2,
    };
}

/**
 * Resolve the active item of a container from an `active` selector or ref.
 *
 * Returns null when nothing matches, or when the match lives outside the container — the
 * caller tracks the returned element's identity to know when to scroll, so it must only
 * ever be an item this container can actually scroll to.
 */
export function resolveActiveItem<T extends { contains: (other: T) => boolean }>(
    active: string | { current: T | null },
    container: T & { querySelector: (selector: string) => T | null }
): T | null {
    const item = typeof active === 'string' ? container.querySelector(active) : active.current;
    if (!item || !container.contains(item)) {
        return null;
    }
    return item;
}
