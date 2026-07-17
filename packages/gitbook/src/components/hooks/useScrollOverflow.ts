'use client';

import * as React from 'react';
import { useScrollListener } from './useScrollListener';

/**
 * Track the scroll position and overflow amount of a scrollable container,
 * keeping them in sync with scroll events, resizes, and content changes.
 */
export function useScrollOverflow(
    orientation: 'horizontal' | 'vertical',
    containerRef: React.RefObject<HTMLElement | null>,
    children: React.ReactNode
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

    // Measure synchronously after mount and whenever the rendered children change,
    // so overflow is detected immediately instead of waiting for a resize/scroll event.
    React.useLayoutEffect(() => {
        measure();
    }, [measure, children]);

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
        mo.observe(container, { childList: true });

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
