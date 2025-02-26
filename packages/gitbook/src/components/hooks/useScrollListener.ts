'use client';

import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Listen for scroll events on an element in a performant way.
 *
 * @example
 * const Example = () => {
 *  const ref = useRef(null);
 *   useScrollListener((event) => {
 *    console.log('scroll', event);
 *  }, ref);
 *
 *  return <div ref={ref} />;
 * }
 */
export function useScrollListener(
    listener: (event: Event) => void,
    elementRef: RefObject<HTMLElement | Window> | null
) {
    const listenerRef = useRef(listener);
    useLayoutEffect(() => {
        listenerRef.current = listener;
    });
    useEffect(() => {
        const element = elementRef?.current;
        if (!element) {
            return undefined;
        }
        let ticking = false;
        const listener = (ev: Event) => {
            if (ticking) {
                return;
            }
            requestAnimationFrame(() => {
                listenerRef.current(ev);
                ticking = false;
            });
            ticking = true;
        };
        element.addEventListener('scroll', listener, { passive: true });
        return () => {
            element.removeEventListener('scroll', listener);
        };
    }, [elementRef]);
}
