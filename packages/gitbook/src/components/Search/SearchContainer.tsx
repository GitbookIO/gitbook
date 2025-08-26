'use client';

import { CustomizationSearchStyle } from '@gitbook/api';
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
import { SearchScopeToggle } from './SearchScopeToggle';
import { useSearch } from './useSearch';

interface SearchContainerProps {
    siteSpaceId: string;
    spaceTitle: string;
    isMultiVariants: boolean;
    style: CustomizationSearchStyle;
    className?: string;
}

/**
 * Client component to render the search input and results.
 */
export function SearchContainer(props: SearchContainerProps) {
    const { siteSpaceId, spaceTitle, isMultiVariants, style, className } = props;

    const { assistants } = useAI();

    const [state, setSearchState] = useSearch();
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
        assistants[0]?.open(state?.ask ?? undefined);
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
            global: prev?.global ?? false,
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

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            resultsRef.current?.moveUp();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            resultsRef.current?.moveDown();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            resultsRef.current?.select();
        }
    };

    const onChange = (value: string) => {
        setSearchState((prev) => ({
            ask: withAI && !withSearchAI ? (prev?.ask ?? null) : null, // When typing, we reset ask to get back to normal search (unless non-search assistants are defined)
            query: value,
            global: prev?.global ?? false,
            open: true,
        }));
    };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state?.query?.trim() ?? '';
    const normalizedAsk = state?.ask?.trim() ?? '';

    const showAsk = withSearchAI && normalizedAsk; // withSearchAI && normalizedAsk;

    return (
        <SearchAskProvider value={searchAsk}>
            <Popover
                content={
                    // Only show content if there's a query or Ask is enabled
                    state?.query || withAI ? (
                        <React.Suspense fallback={null}>
                            {isMultiVariants && !showAsk ? (
                                <SearchScopeToggle spaceTitle={spaceTitle} />
                            ) : null}
                            {state !== null && !showAsk ? (
                                <SearchResults
                                    ref={resultsRef}
                                    query={normalizedQuery}
                                    global={state?.global ?? false}
                                    siteSpaceId={siteSpaceId}
                                />
                            ) : null}
                            {showAsk ? <SearchAskAnswer query={normalizedAsk} /> : null}
                        </React.Suspense>
                    ) : null
                }
                rootProps={{
                    open: state?.open ?? false,
                    onOpenChange: (open) => {
                        open ? onOpen() : onClose();
                    },
                    modal: isMobile,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        'bg-tint-base has-[.empty]:hidden scroll-py-2 w-128 p-2 max-h-[min(32rem,var(--radix-popover-content-available-height))] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: (event) => {
                        // Don't close if clicking on the search input itself
                        if (searchInputRef.current?.contains(event.target as Node)) {
                            return;
                        }
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
                    value={state?.query ?? (withSearchAI || !withAI ? state?.ask : null) ?? ''}
                    onFocus={onOpen}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    withAI={withSearchAI}
                    isOpen={state?.open ?? false}
                    className={className}
                />
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
