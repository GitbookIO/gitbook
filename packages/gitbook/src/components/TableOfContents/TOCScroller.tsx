'use client';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    type ComponentPropsWithoutRef,
} from 'react';
import { assert } from 'ts-essentials';

interface TOCScrollContainerContextType {
    getContainer: (listener: (element: HTMLDivElement) => void) => () => void;
}

const TOCScrollContainerContext = React.createContext<TOCScrollContainerContextType | null>(null);

function useTOCScrollContainerContext() {
    const ctx = React.useContext(TOCScrollContainerContext);
    assert(ctx);
    return ctx;
}

/**
 * Table of contents scroll container.
 */
export function TOCScrollContainer(props: ComponentPropsWithoutRef<'div'>) {
    const ref = useRef<HTMLDivElement>(null);
    const listeners = useRef<((element: HTMLDivElement) => void)[]>([]);
    const getContainer: TOCScrollContainerContextType['getContainer'] = useCallback((listener) => {
        if (ref.current) {
            listener(ref.current);
            return () => {};
        }
        listeners.current.push(listener);
        return () => {
            listeners.current = listeners.current.filter((l) => l !== listener);
        };
    }, []);
    const value: TOCScrollContainerContextType = useMemo(() => ({ getContainer }), [getContainer]);
    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        listeners.current.forEach((listener) => listener(element));
        return () => {
            listeners.current = [];
        };
    }, []);

    return (
        <TOCScrollContainerContext.Provider value={value}>
            <div ref={ref} data-testid="toc-scroll-container" {...props} />
        </TOCScrollContainerContext.Provider>
    );
}

// Offset to scroll the table of contents item by.
const TOC_ITEM_OFFSET = 100;

/**
 * Scrolls the table of contents container to the page item when it's initially active.
 */
export function useScrollToActiveTOCItem(props: {
    anchorRef: React.RefObject<HTMLAnchorElement>;
    isActive: boolean;
}) {
    const { isActive, anchorRef } = props;
    const { getContainer } = useTOCScrollContainerContext();
    useEffect(() => {
        const anchor = anchorRef.current;
        if (isActive && anchor) {
            return getContainer((container) => {
                if (isOutOfView(anchor, container)) {
                    container.scrollTo({ top: anchor.offsetTop - TOC_ITEM_OFFSET });
                }
            });
        }
    }, [isActive, getContainer, anchorRef]);
}

function isOutOfView(element: HTMLElement, container: HTMLElement) {
    const tocItemTop = element.offsetTop;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    return (
        tocItemTop < containerTop + TOC_ITEM_OFFSET ||
        tocItemTop > containerBottom - TOC_ITEM_OFFSET
    );
}
