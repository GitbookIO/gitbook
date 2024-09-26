import { usePathname } from 'next/navigation';
import React from 'react';

import { useHash } from './useHash';

/**
 * Scroll the page to an anchor point or
 * to the top of the page when navigating between pages (pathname)
 * or sections of a page (hash).
 */
export function useScrollPage() {
    const hash = useHash();
    const pathname = usePathname();
    React.useLayoutEffect(() => {
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash, pathname]);
}
