/**
 * Geometry rule behind {@link useListOverflow}, kept free of React so it can be tested directly
 * against rects measured in a real browser.
 */

export interface MeasuredRect {
    left: number;
    right: number;
}

export interface MeasuredItem {
    id: string;
    rect: MeasuredRect;
}

/** Sub-pixel tolerance, so a row that fits exactly isn't reported as overflowing. */
const EPSILON = 1;

/**
 * Decide which items don't fit the container.
 *
 * Items are expected to be measured with the overflow affordance (a "more" menu, say) already
 * rendered *ahead* of them, which is what lets a single measurement answer both questions: the space
 * before the first item is the width that affordance is reserving, so subtracting it gives the
 * position each item would have without it. The list only has to make room for the affordance if it
 * overflows without one — otherwise a row that fits on its own would give up its last item to a menu
 * it never needed.
 *
 * Returns `null` when the measurement carries no information — an empty list, or a container with no
 * width because an ancestor is hidden (a pane behind an inactive tab). Callers should keep their
 * previous result and re-measure once it is visible.
 */
export function resolveOverflowingItems(
    container: MeasuredRect & { width: number },
    items: MeasuredItem[]
): Set<string> | null {
    if (container.width <= 0 || items.length === 0) {
        return null;
    }

    const reserved = Math.min(...items.map((item) => item.rect.left)) - container.left;
    const fitsUnaided = items.every(
        (item) => item.rect.right - reserved <= container.right + EPSILON
    );

    if (fitsUnaided) {
        return new Set();
    }

    return new Set(
        items.filter((item) => item.rect.right > container.right + EPSILON).map((item) => item.id)
    );
}
