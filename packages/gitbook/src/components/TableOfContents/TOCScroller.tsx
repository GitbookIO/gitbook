'use client';

import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

const TOCScrollContainerRefContext = React.createContext<React.RefObject<HTMLDivElement> | null>(
    null,
);

function useTOCScrollContainerRefContext() {
    const ctx = React.useContext(TOCScrollContainerRefContext);
    if (!ctx) {
        throw new Error('Context `TOCScrollContainerRefContext` must be used within Provider');
    }
    return ctx;
}

export function TOCScrollContainer(props: { children: React.ReactNode; className?: ClassValue }) {
    const { children, className } = props;
    const scrollContainerRef = React.createRef<HTMLDivElement>();

    return (
        <TOCScrollContainerRefContext.Provider value={scrollContainerRef}>
            <div ref={scrollContainerRef} className={tcls(className)}>
                {children}
            </div>
        </TOCScrollContainerRefContext.Provider>
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
    const scrollContainerRef = useTOCScrollContainerRefContext();
    const isScrolled = React.useRef(false);
    React.useLayoutEffect(() => {
        if (!isActive) {
            isScrolled.current = false;
            return;
        }
        if (isScrolled.current) {
            return;
        }
        const tocItem = linkRef.current;
        const tocContainer = scrollContainerRef.current;
        if (!tocItem || !tocContainer || !isOutOfView(tocItem, tocContainer)) {
            return;
        }
        tocContainer?.scrollTo({
            top: tocItem.offsetTop - TOC_ITEM_OFFSET,
        });
        isScrolled.current = true;
    }, [isActive, linkRef, scrollContainerRef]);
}

function isOutOfView(tocItem: HTMLElement, tocContainer: HTMLElement) {
    const tocItemTop = tocItem.offsetTop;
    const containerTop = tocContainer.scrollTop;
    const containerBottom = containerTop + tocContainer.clientHeight;
    return tocItemTop < containerTop + TOC_ITEM_OFFSET || tocItemTop > containerBottom - TOC_ITEM_OFFSET;
}
