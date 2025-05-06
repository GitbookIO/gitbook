'use client';

import React, { useEffect } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';

export type SuggestedPage = {
    id: string;
    title: string;
    href: string;
    icon?: string;
    emoji?: string;
};

export type Journey = {
    label: string;
    icon?: string;
    pages?: Array<SuggestedPage>;
};

type AdaptiveContextType = {
    journeys: Journey[];
    selectedJourney: Journey | undefined;
    setSelectedJourney: (journey: Journey | undefined) => void;
    loading: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
};

export const AdaptiveContext = React.createContext<AdaptiveContextType | null>(null);

export const JOURNEY_COUNT = 4;

/**
 * Client side context provider to pass information about the current page.
 */
export function JourneyContextProvider({
    children,
    spaces,
}: { children: React.ReactNode; spaces: { id: string; title: string }[] }) {
    const [journeys, setJourneys] = React.useState<Journey[]>([]);
    const [selectedJourney, setSelectedJourney] = React.useState<Journey | undefined>(undefined);
    const [loading, setLoading] = React.useState(true);
    const [open, setOpen] = React.useState(true);

    const currentPage = usePageContext();
    const visitedPages = useVisitedPages((state) => state.pages);

    useEffect(() => {
        let canceled = false;

        // setJourneys([]);

        (async () => {
            // const stream = await streamPageJourneySuggestions({
            //     count: JOURNEY_COUNT,
            //     currentPage: {
            //         id: currentPage.pageId,
            //         title: currentPage.title,
            //     },
            //     currentSpace: {
            //         id: currentPage.spaceId,
            //     },
            //     allSpaces: spaces,
            //     visitedPages,
            // });

            // for await (const journey of stream) {
            //     if (canceled) return;

            //     setJourneys((prev) => [...prev, journey]);
            // }

            setLoading(false);
        })();

        return () => {
            canceled = true;
        };
    }, [currentPage.pageId, currentPage.spaceId, currentPage.title, visitedPages, spaces]);

    return (
        <AdaptiveContext.Provider
            value={{ journeys, selectedJourney, setSelectedJourney, loading, open, setOpen }}
        >
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
