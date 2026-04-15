'use client';

import { getLocalizedTitle } from '@/lib/sites';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAI } from '../AI';
import { useTrackEvent } from '../Insights';
import { useBodyLoaded } from '../primitives';
import type { SearchResultsRef } from './SearchResults';
import type { SearchBaseProps } from './search-props';
import { useSearchState, useSetSearchState } from './useSearch';
import { useSearchResults } from './useSearchResults';
import { useSearchResultsCursor } from './useSearchResultsCursor';

function useInitialAskBootstrap(props: {
    asEmbeddable?: boolean;
    assistants: ReturnType<typeof useAI>['assistants'];
    initialAsk: string | null;
    isLoaded: boolean;
}) {
    const { asEmbeddable, assistants, initialAsk, isLoaded } = props;
    const handledInitialAskRef = React.useRef<string | null | undefined>(undefined);

    React.useEffect(() => {
        if (asEmbeddable) return;
        if (assistants.length === 0) return;
        if (initialAsk === null) return;
        if (handledInitialAskRef.current === initialAsk) return;

        // For simplicity we're only triggering the first assistant.
        if (isLoaded) {
            assistants[0]?.open(initialAsk || undefined);
            handledInitialAskRef.current = initialAsk;
        }
    }, [asEmbeddable, assistants, initialAsk, isLoaded]);
}

function useFilteredSiteSpaceIds(props: {
    siteSpaces: SearchBaseProps['siteSpaces'];
    language: string | null | undefined;
}) {
    const { siteSpaces, language } = props;

    return React.useMemo(
        () =>
            siteSpaces.reduce((acc: string[], siteSpace) => {
                if (
                    !language ||
                    !siteSpace.space.language ||
                    siteSpace.space.language === language
                ) {
                    acc.push(siteSpace.id);
                }

                return acc;
            }, []),
        [siteSpaces, language]
    );
}

function useSearchKeyboardNavigation(props: {
    query: string;
    results: ReturnType<typeof useSearchResults>['results'];
    resultsRef: React.RefObject<SearchResultsRef | null>;
}) {
    const { query, results, resultsRef } = props;
    const { cursor, moveBy: moveCursorBy } = useSearchResultsCursor({
        query,
        results,
    });

    const onInputKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                moveCursorBy(-1);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                moveCursorBy(1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                resultsRef.current?.select();
            }
        },
        [moveCursorBy, resultsRef]
    );

    return {
        cursor,
        onInputKeyDown,
    };
}

export function useSearchController(props: SearchBaseProps) {
    const {
        asEmbeddable,
        siteSpace,
        section,
        withVariants,
        withSiteVariants,
        withSections,
        siteSpaces,
        searchURL,
    } = props;

    const { assistants, config } = useAI();
    const state = useSearchState();
    const setSearchState = useSetSearchState();
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const isLoaded = useBodyLoaded();

    const withAI = assistants.length > 0;
    const withSearchAI = assistants.filter((assistant) => assistant.mode === 'search').length > 0;

    // Handle initial ask state on page load, once assistants are ready.
    // `ask=` should still bootstrap the assistant on the docs site, so we must
    // distinguish between `null` (no ask param) and an empty string.
    const initialAsk = state?.ask ?? null;
    useInitialAskBootstrap({ asEmbeddable, assistants, initialAsk, isLoaded });

    const onClose = React.useCallback(
        async (to?: string) => {
            setSearchState((prev) =>
                prev
                    ? {
                          ...prev,
                          open: false,
                          query: prev.query === '' ? null : prev.query,
                      }
                    : null
            );

            if (to) {
                router.push(to);
            }
        },
        [setSearchState, router]
    );

    const onOpen = React.useCallback(() => {
        if (state?.open) {
            return;
        }
        setSearchState((prev) => ({
            ask: withAI ? (prev?.ask ?? null) : null,
            scope: prev?.scope ?? 'default',
            query: prev?.query ?? (withSearchAI || !withAI ? prev?.ask : null) ?? '',
            open: true,
        }));

        trackEvent({
            type: 'search_open',
        });
    }, [state?.open, setSearchState, trackEvent, withAI, withSearchAI]);

    const setQuery = React.useCallback(
        (value: string) => {
            setSearchState((prev) => ({
                ask: withAI && !withSearchAI ? (prev?.ask ?? null) : null,
                query: value,
                scope: prev?.scope ?? 'default',
                open: true,
            }));
        },
        [setSearchState, withAI, withSearchAI]
    );

    const normalizedQuery = state?.query?.trim() ?? '';
    const normalizedAsk = state?.ask?.trim() ?? '';
    const showAsk = withSearchAI && normalizedAsk.length > 0;

    // If searching all variants of the current section (the "extended" scope),
    // filter by language if the language is set for both the current and the target site space.
    const siteSpaceIds = useFilteredSiteSpaceIds({
        siteSpaces,
        language: siteSpace.space.language,
    });

    const { results, fetching, error } = useSearchResults({
        asEmbeddable,
        disabled: !(state?.query || withAI),
        query: normalizedQuery,
        siteSpaceId: siteSpace.id,
        siteSpaceIds,
        scope: state?.scope ?? 'default',
        suggestions: config.suggestions,
        searchURL,
    });

    const searchValue = state?.query ?? (withSearchAI || !withAI ? state?.ask : null) ?? '';
    const searchResultsId = `search-results-${React.useId()}`;

    const { cursor, onInputKeyDown } = useSearchKeyboardNavigation({
        query: normalizedQuery,
        results,
        resultsRef,
    });

    return {
        assistants,
        askQuery: normalizedAsk,
        cursor,
        error,
        fetching,
        open: onOpen,
        close: onClose,
        query: normalizedQuery,
        results,
        resultsId: searchResultsId,
        resultsRef,
        searchValue,
        setQuery,
        state,
        onInputKeyDown,
        showAsk,
        withAI,
        withSearchAI,
        scopeControl: {
            section,
            spaceTitle: getLocalizedTitle(siteSpace, siteSpace.space.language),
            withVariants,
            withSiteVariants,
            withSections,
        },
    };
}
