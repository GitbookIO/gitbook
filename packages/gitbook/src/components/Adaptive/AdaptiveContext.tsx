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

    // Start with a default state that works for SSR
    const [toggle, setToggle] = React.useState({
        open: false, // Default to open for SSR
        manual: false,
    });

    // Update the toggle state on the client side only
    React.useEffect(() => {
        // Check for mobile only on the client
        const handleResize = () => {
            if (!toggle.manual) {
                const isMobile = window.innerWidth < 1280;
                setToggle((prev) => ({
                    ...prev,
                    open: !isMobile,
                }));
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [toggle.manual]);

    React.useEffect(() => {
        if (toggle.open) {
            document.body.classList.add('adaptive-pane');
        } else {
            document.body.classList.remove('adaptive-pane');
        }
    }, [toggle.open]);

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
