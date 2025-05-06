'use client';

import React from 'react';

type AdaptiveContextType = {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    toggle: {
        open: boolean;
        manual: boolean;
    };
    setToggle: (toggle: { open: boolean; manual: boolean }) => void;
};

export const AdaptiveContext = React.createContext<AdaptiveContextType | null>(null);

/**
 * Client side context provider to pass information about the current page.
 */
export function AdaptiveContextProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = React.useState(true);
    const [toggle, setToggle] = React.useState({
        open: true,
        manual: false,
    });

    return (
        <AdaptiveContext.Provider value={{ loading, setLoading, toggle, setToggle }}>
            {children}
        </AdaptiveContext.Provider>
    );
}

/**
 * Hook to use the adaptive context.
 */
export function useAdaptiveContext() {
    const context = React.useContext(AdaptiveContext);
    if (!context) {
        throw new Error('useAdaptiveContext must be used within a AdaptiveContextProvider');
    }
    return context;
}
