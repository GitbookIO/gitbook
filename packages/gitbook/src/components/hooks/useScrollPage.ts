import { usePathname } from 'next/navigation';
import React from 'react';

import { useHash } from './useHash';

/**
 * Scroll the page to an anchor point or
 * to the top of the page when navigating between pages (pathname)
 * or sections of a page (hash).
 */
export function useScrollPage(props: { scrollMarginTop?: number }) {
    const hash = useHash();
    const pathname = usePathname();
    React.useLayoutEffect(() => {
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                if (props.scrollMarginTop) {
                    element.style.scrollMarginTop = `${props.scrollMarginTop}px`;
                }
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        } else {
            window.scrollTo(0, 0);
        }
        return () => {
            if (hash) {
                const element = document.getElementById(hash);
                if (element) {
                    element.style.scrollMarginTop = '';
                }
            }
        };
    }, [hash, pathname, props.scrollMarginTop]);
}
