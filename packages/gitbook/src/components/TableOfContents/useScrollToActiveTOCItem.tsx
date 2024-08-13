'use client';

import React from 'react';

import { tcls } from '@/lib/tailwind';

const TOCScrollContainerContext = React.createContext<React.RefObject<HTMLDivElement> | null>(null);

export function TOCScrollContainerProvider(
    props: React.PropsWithChildren<{ withHeaderOffset: boolean; withTrademarkEnabled: boolean }>,
) {
    const { withHeaderOffset, withTrademarkEnabled, children } = props;
    const scrollContainerRef = React.createRef<HTMLDivElement>();

    return (
        <TOCScrollContainerContext.Provider value={scrollContainerRef}>
            <div
                ref={scrollContainerRef}
                className={tcls(
                    withHeaderOffset ? 'pt-4' : ['pt-4', 'lg:pt-0'],
                    'hidden',
                    'lg:flex',
                    'flex-grow',
                    'flex-col',
                    'overflow-y-auto',
                    'lg:gutter-stable',
                    'lg:pr-2',
                    'group-hover:[&::-webkit-scrollbar]:bg-dark/1',
                    'group-hover:[&::-webkit-scrollbar-thumb]:bg-dark/3',
                    '[&::-webkit-scrollbar]:bg-transparent',
                    '[&::-webkit-scrollbar-thumb]:bg-transparent',
                    'dark:[&::-webkit-scrollbar]:bg-transparent',
                    'dark:[&::-webkit-scrollbar-thumb]:bg-transparent',
                    'dark:group-hover:[&::-webkit-scrollbar]:bg-light/1',
                    'dark:group-hover:[&::-webkit-scrollbar-thumb]:bg-light/3',
                    'navigation-open:flex', // can be auto height animated as such https://stackoverflow.com/a/76944290
                    'lg:-ml-5',
                    withTrademarkEnabled ? 'lg:pb-20' : 'lg:pb-4',
                )}
            >
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
    React.useEffect(() => {
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
                        behavior: 'smooth',
                    });
                }
            }
        }
    }, [isActive, linkRef, scrollContainerRef]);
}
