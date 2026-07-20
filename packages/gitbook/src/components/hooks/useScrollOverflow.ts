'use client';

import * as React from 'react';
import { useScrollListener } from './useScrollListener';

/**
 * Track the scroll position and overflow amount of a scrollable container,
 * keeping them in sync with scroll events, resizes, and content changes.
 */
export function useScrollOverflow(
    orientation: 'horizontal' | 'vertical',
    containerRef: React.RefObject<HTMLElement | null>
) {
    const [scrollPosition, setScrollPosition] = React.useState(0);
    const [scrollSize, setScrollSize] = React.useState(0);

    const measure = React.useCallback(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const scrollDimension =
            orientation === 'horizontal' ? container.scrollWidth : container.scrollHeight;
        const clientDimension =
            orientation === 'horizontal' ? container.clientWidth : container.clientHeight;

        setScrollSize(Math.max(scrollDimension - clientDimension - 1, 0));
        setScrollPosition(
            orientation === 'horizontal' ? container.scrollLeft : container.scrollTop
        );
    }, [orientation, containerRef]);

    useScrollListener(measure, containerRef);

    // Measure synchronously on mount (and when the container/orientation changes), so
    // initial overflow is detected without waiting for a resize/scroll event. Subsequent
    // content changes are picked up by the observers below instead of re-measuring on
    // every render.
    React.useLayoutEffect(() => {
        measure();
    }, [measure]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        // Children can overflow (or stop overflowing) without the container itself
        // changing size, so we observe the direct children in addition to the container,
        // and re-register observers as children are added/removed.
        let frame: number | null = null;
        const scheduleMeasure = () => {
            if (frame !== null) {
                return;
            }
            frame = requestAnimationFrame(() => {
                frame = null;
                measure();
            });
        };

        const ro = new ResizeObserver(scheduleMeasure);
        ro.observe(container);
        for (const child of Array.from(container.children)) {
            ro.observe(child);
        }

        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Only re-register direct children with the resize observer; descendants
                // deeper in the tree are covered by their parent's resize/mutation handling.
                if (mutation.target !== container) {
                    continue;
                }
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node instanceof Element) {
                        ro.observe(node);
                    }
                }
                for (const node of Array.from(mutation.removedNodes)) {
                    if (node instanceof Element) {
                        ro.unobserve(node);
                    }
                }
            }
            scheduleMeasure();
        });
        // Also watch descendants (subtree/characterData) so text/content changes deeper in
        // the tree that grow or shrink scrollHeight/scrollWidth still trigger a re-measure.
        mo.observe(container, { childList: true, subtree: true, characterData: true });

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }
            ro.disconnect();
            mo.disconnect();
        };
    }, [measure, containerRef]);

    return { scrollPosition, scrollSize };
}
