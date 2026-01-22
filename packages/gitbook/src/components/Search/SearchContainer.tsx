'use client';

import { t, useLanguage } from '@/intl/client';
import { CustomizationSearchStyle, type SiteSection, type SiteSpace } from '@gitbook/api';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAI } from '../AI';
import { AIChatButton } from '../AIChat';
import { useTrackEvent } from '../Insights';
import { useIsMobile } from '../hooks/useIsMobile';
import { Popover } from '../primitives';
import { SearchAskAnswer } from './SearchAskAnswer';
import { useSearchAskState } from './SearchAskContext';
import { SearchAskProvider } from './SearchAskContext';
import { SearchInput } from './SearchInput';
import { SearchResults, type SearchResultsRef } from './SearchResults';
import { SearchScopeControl } from './SearchScopeControl';
import { useSearchState, useSetSearchState } from './useSearch';
import { useSearchResults } from './useSearchResults';
import { useSearchResultsCursor } from './useSearchResultsCursor';

interface SearchContainerProps {
    /** The current site space. */
    siteSpace: SiteSpace;

    /** All site spaces in the current section. */
    siteSpaces: ReadonlyArray<SiteSpace>;

    /** Whether there are sections on the site. */
    withSections: boolean;

    /** The current section, displayed in search scope toggle. */
    section?: Pick<SiteSection, 'title' | 'icon'>;

    /** Whether the current section has variants. */
    withVariants: boolean;

    /** Whether any section on the site has variants. */
    withSiteVariants: boolean;

    style: CustomizationSearchStyle;
    className?: string;
    viewport?: 'desktop' | 'mobile';
}

/**
 * Client component to render the search input and results.
 */
export function SearchContainer({
    siteSpace,
    section,
    withVariants,
    withSiteVariants,
    withSections,
    style,
    className,
    viewport,
    siteSpaces,
}: SearchContainerProps) {
    const { assistants, config } = useAI();

    const state = useSearchState();
    const setSearchState = useSetSearchState();
    const searchAsk = useSearchAskState();
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = useRef<SearchResultsRef>(null);
    const searchInputRef = useRef<HTMLDivElement>(null);

    const isMobile = useIsMobile();

    const withAI = assistants.length > 0;
    const withSearchAI = assistants.filter((assistant) => assistant.mode === 'search').length > 0;

    // Handle initial ask state on page load, once assistants are ready
    const initialRef = React.useRef(state?.ask === undefined || state?.ask === null); // If ask is not set on page load, we will never trigger
    React.useEffect(() => {
        if (initialRef.current) return;
        if (assistants.length === 0) return;
        if (state?.ask === undefined || state?.ask === null) return;

        initialRef.current = true;

        // For simplicity we're only triggering the first assistant
        assistants[0]?.open(state.ask ?? undefined);
    }, [state?.ask, assistants.length, assistants[0]?.open]);

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

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            onOpen();
        },
        {
            enableOnFormTags: true,
        }
    );

    useHotkeys(
        'mod+i',
        (e) => {
            e.preventDefault();
            if (assistants) {
                assistants[0]?.open();
            }
        },
        {
            enableOnFormTags: true,
        }
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

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const onChange = (value: string) => {
        setSearchState((prev) => ({
            ask: withAI && !withSearchAI ? (prev?.ask ?? null) : null, // When typing, we reset ask to get back to normal search (unless non-search assistants are defined)
            query: value,
            scope: prev?.scope ?? 'default',
            open: true,
        }));
    };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state?.query?.trim() ?? '';
    const normalizedAsk = state?.ask?.trim() ?? '';

    const showAsk = withSearchAI && normalizedAsk;

    const visible = viewport === 'desktop' ? !isMobile : viewport === 'mobile' ? isMobile : true;

    const searchResultsId = `search-results-${React.useId()}`;

    // If searching all variants of the current section (the "extended" scope),
    // filter by language if the language is set for both the current and the target site space.
    const siteSpaceIds = React.useMemo(
        () =>
            siteSpaces.reduce((acc: string[], ss) => {
                if (
                    !siteSpace.space.language ||
                    !ss.space.language ||
                    ss.space.language === siteSpace.space.language
                ) {
                    acc.push(ss.id);
                }

                return acc;
            }, []),
        [siteSpaces, siteSpace.space.language]
    );

    const { results, fetching, error } = useSearchResults({
        disabled: !(state?.query || withAI),
        query: normalizedQuery,
        siteSpaceId: siteSpace.id,
        siteSpaceIds,
        scope: state?.scope ?? 'default',
        withAI,
        suggestions: config.suggestions,
    });
    const searchValue = state?.query ?? (withSearchAI || !withAI ? state?.ask : null) ?? '';

    const { cursor, moveBy: moveCursorBy } = useSearchResultsCursor({
        query: normalizedQuery,
        results,
    });
    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    };

    return (
        <SearchAskProvider value={searchAsk}>
            <Popover
                content={
                    // Only show content if there's a query or Ask is enabled
                    state?.query || withAI ? (
                        <React.Suspense fallback={null}>
                            <div className="scroll-py-2 overflow-y-scroll p-2">
                                {state !== null && !showAsk ? (
                                    <SearchResults
                                        ref={resultsRef}
                                        query={normalizedQuery}
                                        id={searchResultsId}
                                        fetching={fetching}
                                        results={results}
                                        cursor={cursor}
                                        error={error}
                                    />
                                ) : null}
                                {showAsk ? <SearchAskAnswer query={normalizedAsk} /> : null}
                            </div>
                            {(withVariants || withSections) && !showAsk ? (
                                <div className="border-tint-subtle border-t bg-tint-subtle px-4 py-1.5">
                                    <SearchScopeControl
                                        section={section}
                                        spaceTitle={siteSpace.title}
                                        withVariants={withVariants}
                                        withSiteVariants={withSiteVariants}
                                        withSections={withSections}
                                    />
                                </div>
                            ) : null}
                        </React.Suspense>
                    ) : null
                }
                rootProps={{
                    open: Boolean(visible && (state?.open ?? false)),
                    modal: false,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        '@container flex flex-col bg-tint-base has-[.empty]:hidden w-128 p-0 max-h-[min(32rem,var(--radix-popover-content-available-height))] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: (event) => {
                        // Don't close if clicking on the search input itself
                        if (searchInputRef.current?.contains(event.target as Node)) {
                            event.preventDefault();
                            return;
                        }
                        onClose();
                    },
                    sideOffset: 8,
                    collisionPadding: {
                        top: 16,
                        right: 16,
                        bottom: 32,
                        left: 16,
                    },
                    hideWhenDetached: true,
                }}
                triggerProps={{
                    asChild: true,
                }}
            >
                <SearchInput
                    ref={searchInputRef}
                    value={searchValue}
                    onFocus={onOpen}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    withAI={withSearchAI}
                    isOpen={state?.open ?? false}
                    className={className}
                    aria-controls={searchResultsId}
                    aria-activedescendant={
                        cursor !== null ? `${searchResultsId}-${cursor}` : undefined
                    }
                >
                    <LiveResultsAnnouncer
                        count={results.length}
                        showing={Boolean(searchValue) && !fetching}
                    />
                </SearchInput>
            </Popover>
            {assistants
                .filter((assistant) => assistant.ui === true)
                .map((assistant, index) => (
                    <AIChatButton
                        key={assistant.id}
                        assistant={assistant}
                        withShortcut={index === 0}
                        showLabel={
                            assistants.filter((assistant) => assistant.ui === true).length === 1 &&
                            style === CustomizationSearchStyle.Prominent
                        }
                    />
                ))}
        </SearchAskProvider>
    );
}

/*
 *  Screen reader announcement for search results.
 *  Without it there is no feedback for screen reader users when a search returns no results.
 */
function LiveResultsAnnouncer({ count, showing }: { count: number; showing: boolean }) {
    const language = useLanguage();
    return (
        <div className="sr-only" aria-live="assertive" role="alert" aria-relevant="all">
            {showing
                ? count > 0
                    ? t(language, 'search_results_count', count)
                    : t(language, 'search_no_results')
                : ''}
        </div>
    );
}
