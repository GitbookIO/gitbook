'use client';
import { useEffect, useState } from 'react';

const HAS_INTERSECTION_OBSERVER = typeof IntersectionObserver !== 'undefined';

/**
 * Return true if the element has been in the viewport once.
 */
export function useHasBeenInViewport(
    containerRef: React.RefObject<HTMLElement>,
    options?: Pick<IntersectionObserverInit, 'root' | 'rootMargin' | 'threshold'>
) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        // We set the element as visible if the IntersectionObserver API is not available.
        // we have to do it in the `useEffect` to be SSR compatible.
        if (!HAS_INTERSECTION_OBSERVER) {
            setVisible(true);
            return;
        }

        if (!containerRef.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
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
    return visible;
}
