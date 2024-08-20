import React from 'react';

import { useHash } from './useHash';

/**
 * Scroll to the current URL hash everytime the URL changes.
 */
export function useScrollToHash() {
    const hash = useHash();
    React.useLayoutEffect(() => {
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        }
    }, [hash]);
}
