'use client';

import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { useHash } from '../hooks';

const TOCScrollContainerContext = React.createContext<React.RefObject<HTMLDivElement> | null>(null);

export function TOCScrollContainerProvider(props: {
    children: React.ReactNode;
    className?: ClassValue;
}) {
    const { children, className } = props;
    const scrollContainerRef = React.createRef<HTMLDivElement>();

    return (
        <TOCScrollContainerContext.Provider value={scrollContainerRef}>
            <div ref={scrollContainerRef} className={tcls(className)}>
                {children}
            </div>
        </TOCScrollContainerContext.Provider>
    );
}

// Offset to scroll the table of contents item by.
const TOC_ITEM_OFFSET = 200;
/**
 * Scrolls the table of contents container to the page item when it becomes active
 */
export function useScrollToActiveTOCItem(props: {
    isActive: boolean;
    linkRef: React.RefObject<HTMLAnchorElement>;
}) {
    const { isActive, linkRef } = props;

    const hash = useHash();
    const scrollContainerRef = React.useContext(TOCScrollContainerContext);
    const isScrolled = React.useRef(false);

    const isOutOfView = React.useCallback(() => {
        if (linkRef.current && scrollContainerRef?.current) {
            const tocItem = linkRef.current;
            const tocContainer = scrollContainerRef.current;

            const tocItemTop = tocItem.offsetTop;
            const containerTop = tocContainer.scrollTop;
            const containerBottom = containerTop + tocContainer.clientHeight;

            return (
                tocItemTop < containerTop + TOC_ITEM_OFFSET ||
                tocItemTop > containerBottom - TOC_ITEM_OFFSET
            );
        }
        return false;
    }, [linkRef, scrollContainerRef]);

    React.useLayoutEffect(() => {
        if (!isActive) {
            isScrolled.current = false;
            return;
        }
        if (!isOutOfView() || isScrolled.current) {
            return;
        }
        const tocItem = linkRef.current;
        const tocContainer = scrollContainerRef?.current;
        if (!tocItem || !tocContainer) {
            return;
        }
        tocContainer?.scrollTo({
            top: tocItem.offsetTop - TOC_ITEM_OFFSET,
        });
        isScrolled.current = true;
        // We've included `hash` from `useHash` hook as a dependency so we trigger the effect in response to changes to the url hash
    }, [hash, isActive, isOutOfView, linkRef, scrollContainerRef]);
}
