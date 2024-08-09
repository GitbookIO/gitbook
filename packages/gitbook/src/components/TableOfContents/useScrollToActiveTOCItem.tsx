'use client';

import React from 'react';

const TOCScrollContainerContext = React.createContext<string | null>(null);

const SCROLL_OFFSET = 200;

/**
 * Provider that supplies the ID of the scroll container for the table of contents.
 */
export function TOCScrollContainerProvider(
    props: React.PropsWithChildren<{ scrollContainerId: string }>,
) {
    const { children, scrollContainerId } = props;

    return (
        <TOCScrollContainerContext.Provider value={scrollContainerId}>
            {children}
        </TOCScrollContainerContext.Provider>
    );
}

/**
 * Scrolls the table of contents container to the page item when it becomes active,
 * but only if the item is outside the viewable area of the container.
 */
export function useScrollToActiveTOCItem(tocItem: {
    isActive: boolean;
    linkRef: React.RefObject<HTMLAnchorElement>;
}) {
    const { isActive, linkRef } = tocItem;
    const scrollContainerId = React.useContext(TOCScrollContainerContext);

    React.useEffect(() => {
        if (isActive && linkRef.current && scrollContainerId) {
            const container = document.getElementById(scrollContainerId);

            if (container) {
                const itemTop = linkRef.current.offsetTop;
                const itemBottom = itemTop + linkRef.current.offsetHeight;
                const containerTop = container.scrollTop;
                const containerBottom = containerTop + container.clientHeight;

                // Only scroll if the TOC item is outside the viewable area of the container
                if (itemTop < containerTop || itemBottom > containerBottom) {
                    container.scrollTo({
                        top: itemTop - SCROLL_OFFSET,
                        behavior: 'smooth',
                    });
                }
            }
        }
    }, [isActive, linkRef, scrollContainerId]);
}
