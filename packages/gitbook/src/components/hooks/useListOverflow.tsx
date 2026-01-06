'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
 * In the measuring phase indicated by `isMeasuring`, all items must be rendered.
 */
export function useListOverflow(): OverflowState {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState<Set<string>>(new Set());
    const [isMeasuring, setIsMeasuring] = useState(false);
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

    // Measure on mount and when container size changes
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        setIsMeasuring(true);

        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                setIsMeasuring(true);
            });
        });

        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Measure which items are overflowing
    useLayoutEffect(() => {
        if (!containerRef.current || !isMeasuring) {
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const newOverflowing = new Set<string>();

        itemRefs.current.forEach((el, id) => {
            const elRect = el.getBoundingClientRect();
            if (elRect.right > containerRect.right + 1) {
                newOverflowing.add(id);
            }
        });

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
        setIsMeasuring(false);
    }, [isMeasuring]);

    return { containerRef, itemRef, overflowing, isMeasuring };
}
