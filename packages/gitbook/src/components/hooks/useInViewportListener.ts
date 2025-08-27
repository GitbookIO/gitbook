'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';

const HAS_INTERSECTION_OBSERVER = typeof IntersectionObserver !== 'undefined';

/**
 * Watch an element to know when it is in the viewport.
 */
export function useInViewportListener(
    containerRef: React.RefObject<HTMLElement>,
    listener: (isIntersecting: boolean, disconnect: () => void) => void,
    options?: Pick<IntersectionObserverInit, 'root' | 'rootMargin' | 'threshold'>
) {
    const listenerRef = useRef(listener);
    useLayoutEffect(() => {
        listenerRef.current = listener;
    });
    const isIntersectingRef = useRef(false);
    useEffect(() => {
        // We set the element as visible if the IntersectionObserver API is not available.
        // we have to do it in the `useEffect` to be SSR compatible.
        if (!HAS_INTERSECTION_OBSERVER) {
            listenerRef.current(true, () => {});
            return;
        }

        if (!containerRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry?.isIntersecting ?? false;
                isIntersectingRef.current = isIntersecting;
                listenerRef.current(isIntersecting, () => {
                    observer.disconnect();
                });
            },
            {
                root: options?.root,
                rootMargin: options?.rootMargin,
                threshold: options?.threshold,
            }
        );

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [containerRef, options?.root, options?.rootMargin, options?.threshold]);
}
