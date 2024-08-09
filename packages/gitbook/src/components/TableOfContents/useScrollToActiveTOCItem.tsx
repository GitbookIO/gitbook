'use client';

import React from 'react';

/**
 * Scrolls the page item into the table of contents view when active.
 */
export function useScrollToActiveTOCItem(tocItem: {
    isActive: boolean;
    linkRef: React.RefObject<HTMLAnchorElement>;
}) {
    const { isActive, linkRef } = tocItem;

    React.useEffect(() => {
        if (isActive && linkRef.current) {
            linkRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }, [isActive, linkRef]);
}
