'use client';

import React from 'react';

export type PageContextType = {
    pageId: string;
    title: string;
    spaceId: string;
    spaceTitle: string;
};

export const PageContext = React.createContext<PageContextType | null>(null);

/**
 * Client side context provider to pass information about the current page.
 */
export function PageContextProvider(props: PageContextType & { children: React.ReactNode }) {
    const { pageId, spaceId, title, spaceTitle, children } = props;

    const value = React.useMemo(
        () => ({ pageId, spaceId, spaceTitle, title }),
        [pageId, spaceId, spaceTitle, title]
    );

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

/**
 * Hook to use the page context.
 */
export function usePageContext() {
    const context = React.useContext(PageContext);
    if (!context) {
        throw new Error('usePageContext must be used within a PageContextProvider');
    }
    return context;
}
