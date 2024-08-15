'use client';

import React from 'react';

const TOCScrollContainerContext = React.createContext<React.RefObject<HTMLDivElement> | null>(null);

export function TOCScrollContainerProvider(
    props: React.PropsWithChildren<{
        className: React.HTMLAttributes<HTMLDivElement>['className'];
    }>,
) {
    const { className, children } = props;
    const scrollContainerRef = React.createRef<HTMLDivElement>();

    return (
        <TOCScrollContainerContext.Provider value={scrollContainerRef}>
            <div ref={scrollContainerRef} className={className}>
                {children}
            </div>
        </TOCScrollContainerContext.Provider>
    );
}

// Offset to scroll the table of contents item by.
const TOC_ITEM_OFFSET = 200;

/**
 * Scrolls the table of contents container to the page item when it becomes active,
 * but only if the item is outside the viewable area of the container.
 */
export function useScrollToActiveTOCItem(tocItem: {
    isActive: boolean;
    linkRef: React.RefObject<HTMLAnchorElement>;
}) {
    const { isActive, linkRef } = tocItem;

    const scrollContainerRef = React.useContext(TOCScrollContainerContext);
    React.useLayoutEffect(() => {
        if (isActive && linkRef.current && scrollContainerRef?.current) {
            const tocItem = linkRef.current;
            const tocContainer = scrollContainerRef.current;

            if (tocContainer) {
                const tocItemTop = tocItem.offsetTop;
                const containerTop = tocContainer.scrollTop;
                const containerBottom = containerTop + tocContainer.clientHeight;

                // Only scroll if the TOC item is outside the viewable area of the container
                if (
                    tocItemTop < containerTop + TOC_ITEM_OFFSET ||
                    tocItemTop > containerBottom - TOC_ITEM_OFFSET
                ) {
                    tocContainer.scrollTo({
                        top: tocItemTop - TOC_ITEM_OFFSET,
                    });
                }
            }
        }
    }, [isActive, linkRef, scrollContainerRef]);
}
