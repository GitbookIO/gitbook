'use client';

import * as React from 'react';
import * as zustand from 'zustand';

export type PagePointer = {
    spaceId: string;
    pageId: string;
};

const ReactCurrentPageContext = React.createContext<PagePointer | null | undefined>(undefined);

/**
 * A store for the pages that have been visited in the current session.
 */
const visitedPagesStore = zustand.create<{
    pages: PagePointer[];
    addPage: (page: PagePointer) => void;
}>((set) => ({
    pages: [],
    addPage: (page) =>
        set((state) => {
            const lastPage = state.pages[state.pages.length - 1];
            if (lastPage && lastPage.spaceId === page.spaceId && lastPage.pageId === page.pageId) {
                return { pages: state.pages };
            }

            return { pages: [...state.pages, page] };
        }),
}));

/**
 * Provider for the current page.
 */
export function CurrentPageProvider(
    props: React.PropsWithChildren<{
        page: PagePointer | null;
    }>
) {
    const { page, children } = props;
    const addPage = zustand.useStore(visitedPagesStore, (state) => state.addPage);

    const contextValue = React.useMemo(() => {
        return page
            ? {
                  spaceId: page.spaceId,
                  pageId: page.pageId,
              }
            : null;
    }, [page]);

    React.useEffect(() => {
        if (contextValue) {
            addPage(contextValue);
        }
    }, [contextValue, addPage]);

    return (
        <ReactCurrentPageContext.Provider value={contextValue}>
            {children}
        </ReactCurrentPageContext.Provider>
    );
}

/**
 * Get the pointer to the current page.
 */
export function useCurrentPage() {
    const currentPage = React.useContext(ReactCurrentPageContext);
    const lastVisitedPage = zustand.useStore(
        visitedPagesStore,
        (state) => state.pages[state.pages.length - 1]
    );

    if (currentPage !== undefined) {
        return currentPage;
    }

    // If the context is undefined, we are in a layout component (outside the page component)
    // We use the "deferred" value using the visited pages.
    return lastVisitedPage ?? null;
}

/**
 * Return the list of recently visited pages.
 */
export function useVisitedPages() {
    const pages = zustand.useStore(visitedPagesStore, (state) => state.pages);
    return pages;
}
