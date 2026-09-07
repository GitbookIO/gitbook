'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { resolveOverflowingItems } from './listOverflow';

interface OverflowState {
    /**
     * Ref for the container element.
     */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /**
     * Ref callback for each item in the list.
     */
    itemRef: (element: HTMLElement | null) => void;
    /**
     * Set of IDs that are currently overflowing.
     */
    overflowing: Set<string>;
    /**
     * Indicates if we are currently measuring the list.
     */
    isMeasuring: boolean;
}

/**
 * Detects which items are overflowing in a horizontal list.
 * The items must have unique IDs set on their elements.
 *
 * In the measuring phase indicated by `isMeasuring`, all items must be rendered. Whatever the list
 * shows *because* items overflow (a "more" menu, say) has to be rendered ahead of the items in that
 * phase: the measurement discounts the space taken before the first item, so a list that fits on its
 * own is not reported as overflowing merely because that menu was reserving room for itself.
 */
export function useListOverflow(): OverflowState {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState<Set<string>>(new Set());
    // Measuring is a request/completed pair of counters rather than a boolean, because a boolean
    // reset can be swallowed: the observer re-arms measuring from a rAF, and when that lands in the
    // same batch as the measure effect's reset the net value is unchanged, so React bails out and the
    // effect — keyed on that value — never runs again, leaving the list stuck measuring with its
    // "more" menu permanently on show. Counters only increase, so a request can't cancel a
    // completion; it just queues another pass.
    const [measureRequest, setMeasureRequest] = useState(0);
    const [measureCompleted, setMeasureCompleted] = useState(0);
    const isMeasuring = measureRequest !== measureCompleted;
    const itemRefs = useRef(new Map<string, HTMLElement>());
    const rafRef = useRef(0);

    const itemRef = useCallback((element: HTMLElement | null) => {
        if (!element) {
            return;
        }
        itemRefs.current.set(element.id, element);
        return () => {
            itemRefs.current.delete(element.id);
        };
    }, []);

    const requestMeasure = useCallback(() => setMeasureRequest((request) => request + 1), []);

    // Measure on mount and when container size changes
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        requestMeasure();

        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(requestMeasure);
        });

        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, [requestMeasure]);

    // Measure which items are overflowing
    useLayoutEffect(() => {
        if (!containerRef.current || !isMeasuring) {
            return;
        }

        const newOverflowing = resolveOverflowingItems(
            containerRef.current.getBoundingClientRect(),
            Array.from(itemRefs.current, ([id, element]) => ({
                id,
                rect: element.getBoundingClientRect(),
            }))
        );

        // `null` means the measurement said nothing (hidden ancestor, or no items) — keep what we
        // had and wait for the observer to fire once it is visible.
        if (newOverflowing) {
            setOverflowing((previous) => {
                if (previous.size !== newOverflowing.size) {
                    return newOverflowing;
                }
                for (const id of previous) {
                    if (!newOverflowing.has(id)) {
                        return newOverflowing;
                    }
                }
                return previous;
            });
        }

        setMeasureCompleted(measureRequest);
    }, [isMeasuring, measureRequest]);

    return { containerRef, itemRef, overflowing, isMeasuring };
}
