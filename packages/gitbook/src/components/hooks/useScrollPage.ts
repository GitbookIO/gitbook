'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

/**
 * Scroll the page to an anchor point or
 * to the top of the page when navigating between pages (pathname)
 * or sections of a page (hash).
 */
export function useScrollPage(props: { scrollMarginTop?: number }) {
    const hash = useHash();
    const pathname = usePathname();
    const prevPathname = usePrevious(pathname);
    const scrollMarginTopRef = React.useRef(props.scrollMarginTop);
    React.useLayoutEffect(() => {
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                const originalScrollMarginTop = element.style.scrollMarginTop;
                if (scrollMarginTopRef.current) {
                    element.style.scrollMarginTop = `${scrollMarginTopRef.current}px`;
                }
                element.scrollIntoView({ block: 'start', behavior: 'smooth' });
                return () => {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.style.scrollMarginTop = originalScrollMarginTop;
                    }
                };
            }
            return;
        }

        if (prevPathname && pathname !== prevPathname) {
            window.scrollTo(0, 0);
        }
    }, [hash, pathname, prevPathname]);
}
