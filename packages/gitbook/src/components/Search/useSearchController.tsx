'use client';

import { getLocalizedTitle } from '@/lib/sites';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAI } from '../AI';
import { useTrackEvent } from '../Insights';
import { useBodyLoaded } from '../primitives';
import type { SearchResultsRef } from './SearchResults';
import {
    clearLastSearchQuery,
    getLastSearchQuery,
    setLastSearchQuery,
    useLastSearchQuery,
} from './last-query';
import { addRecentSearchQuery } from './recent-queries';
import type { SearchBaseProps } from './search-props';
import { useSearchState, useSetSearchState } from './useSearch';
import { type ResultType, useSearchResults } from './useSearchResults';
import { useSearchResultsCursor } from './useSearchResultsCursor';

function useInitialAskBootstrap(props: {
    asEmbeddable?: boolean;
    assistants: ReturnType<typeof useAI>['assistants'];
    initialAsk: string | null;
    isLoaded: boolean;
}) {
    const { asEmbeddable, assistants, initialAsk, isLoaded } = props;
    const hasBootstrappedRef = React.useRef(false);

    React.useEffect(() => {
        if (asEmbeddable) return;
        if (hasBootstrappedRef.current) return;
        if (assistants.length === 0) return;
        if (!isLoaded) return;

        // Mark bootstrap as done once assistants and the body are ready, even if
        // there is no initial ask. Subsequent `ask` changes come from user
        // interactions (e.g. clicking "Ask with …" in the search bar, which also
        // calls `assistant.open` directly) and must not re-trigger this effect.
        hasBootstrappedRef.current = true;

        if (initialAsk !== null) {
            // For simplicity we're only triggering the first assistant.
            assistants[0]?.open(initialAsk || undefined);
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
    abort: () => void;
    askCount: number;
    onAskSelect: (index: number) => void;
}) {
    const { query, results, resultsRef, abort, askCount, onAskSelect } = props;
    const { cursor, moveBy: moveCursorBy } = useSearchResultsCursor({
        query,
        resultCount: results.length,
        totalCount: results.length + askCount,
    });

    const onInputKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                moveCursorBy(-1);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                moveCursorBy(1);
            } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                if (cursor !== null && cursor >= results.length) {
                    onAskSelect(cursor - results.length);
                    return;
                }

                if (resultsRef.current?.select()) {
                    // Stop any in-flight search request only when activating a result.
                    abort();
                }
            }
        },
        [moveCursorBy, cursor, results.length, onAskSelect, resultsRef, abort]
    );

    return {
        cursor,
        onInputKeyDown,
    };
}

export function useSearchController(
    props: SearchBaseProps,
    options: { restoreLastQueryOnMount?: boolean } = {}
) {
    const {
        asEmbeddable,
        siteSpace,
        section,
        withVariants,
        withSiteVariants,
        withSections,
        siteSpaces,
        searchURL,
        indexURL,
    } = props;

    const { assistants, config } = useAI();
    const state = useSearchState();
    const setSearchState = useSetSearchState();
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const isLoaded = useBodyLoaded();

    const restoredLastQueryForSiteSpaceRef = React.useRef<string | null>(null);
    React.useEffect(() => {
        if (
            !options.restoreLastQueryOnMount ||
            restoredLastQueryForSiteSpaceRef.current === siteSpace.id
        ) {
            return;
        }

        restoredLastQueryForSiteSpaceRef.current = siteSpace.id;
        const restoredQuery = getLastSearchQuery(siteSpace.id);
        if (!restoredQuery) {
            return;
        }

        void setSearchState(
            (prev) =>
                prev ?? {
                    ask: null,
                    query: restoredQuery,
                    scope: 'default',
                    open: true,
                }
        );
    }, [options.restoreLastQueryOnMount, setSearchState, siteSpace.id]);

    const withAI = assistants.length > 0;
    const withSearchAI = assistants.filter((assistant) => assistant.mode === 'search').length > 0;

    // Handle initial ask state on page load, once assistants are ready.
    // `ask=` should still bootstrap the assistant on the docs site, so we must
    // distinguish between `null` (no ask param) and an empty string.
    const initialAsk = state?.ask ?? null;
    useInitialAskBootstrap({ asEmbeddable, assistants, initialAsk, isLoaded });

    const onClose = React.useCallback(
        async (to?: string) => {
            setSearchState((prev) => {
                if (!prev) return null;

                if (prev.query !== null) {
                    setLastSearchQuery(siteSpace.id, prev.query);
                }

                return { ...prev, open: false, query: null };
            });

            if (to) {
                router.push(to);
            }
        },
        [setSearchState, router, siteSpace.id]
    );

    const onOpen = React.useCallback(() => {
        if (state?.open) {
            return;
        }
        setSearchState((prev) => {
            const query =
                prev?.query ??
                getLastSearchQuery(siteSpace.id) ??
                (withSearchAI || !withAI ? prev?.ask : null) ??
                '';

            return {
                ask: withAI ? (prev?.ask ?? null) : null,
                scope: prev?.scope ?? 'default',
                query,
                open: true,
            };
        });

        trackEvent({
            type: 'search_open',
        });
    }, [state?.open, setSearchState, siteSpace.id, trackEvent, withAI, withSearchAI]);

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

    const { results, fetching, error, abort } = useSearchResults({
        asEmbeddable,
        disabled: !(state?.query || withAI),
        open: Boolean(state?.open),
        query: normalizedQuery,
        siteSpaceId: siteSpace.id,
        siteSpaceIds,
        scope: state?.scope ?? 'default',
        suggestions: config.suggestions,
        searchURL,
        indexURL,
        lang: siteSpace.space.language,
        withSections,
    });

    const lastSearchQuery = useLastSearchQuery(siteSpace.id);
    const searchValue =
        state?.query ?? (withSearchAI || !withAI ? state?.ask : null) ?? lastSearchQuery ?? '';
    const searchResultsId = `search-results-${React.useId()}`;

    const onResultSelect = React.useCallback(
        (result: ResultType) => {
            clearLastSearchQuery(siteSpace.id);
            abort();

            if (result.type !== 'recommended-question') {
                void setSearchState((prev) =>
                    prev ? { ...prev, query: null, open: false } : null
                );
            }
        },
        [abort, setSearchState, siteSpace.id]
    );

    const askInAssistant = React.useCallback(
        (assistantIndex = 0) => {
            const assistant = assistants[assistantIndex];
            if (!assistant || !normalizedQuery) {
                return;
            }

            if (assistant.mode === 'search') {
                addRecentSearchQuery(siteSpace.id, normalizedQuery, 'ask');
            }

            abort();
            assistant.open(normalizedQuery);
            setSearchState({
                ask: normalizedQuery,
                query: null,
                scope: state?.scope ?? 'default',
                open: assistant.mode === 'search',
            });
        },
        [abort, assistants, normalizedQuery, setSearchState, siteSpace.id, state?.scope]
    );

    const askCount = normalizedQuery && !showAsk ? assistants.length : 0;

    const { cursor, onInputKeyDown } = useSearchKeyboardNavigation({
        query: normalizedQuery,
        results,
        resultsRef,
        abort,
        askCount,
        onAskSelect: askInAssistant,
    });

    return {
        assistants,
        askQuery: normalizedAsk,
        askCount,
        askInAssistant,
        cursor,
        error,
        fetching,
        abort,
        open: onOpen,
        close: onClose,
        onResultSelect,
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
