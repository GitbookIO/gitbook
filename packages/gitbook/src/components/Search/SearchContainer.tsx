'use client';

import { CustomizationAIMode } from '@gitbook/api';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
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
    spaceTitle: string;
    isMultiVariants: boolean;
    aiMode: CustomizationAIMode;
    className?: string;
}

/**
 * Client component to render the search input and results.
 */
export function SearchContainer(props: SearchContainerProps) {
    const { spaceTitle, isMultiVariants, aiMode, className } = props;

    const withAIChat = aiMode === CustomizationAIMode.Assistant;
    const [state, setSearchState] = useSearch(withAIChat);
    const searchAsk = useSearchAskState();
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = useRef<SearchResultsRef>(null);
    const searchInputRef = useRef<HTMLDivElement>(null);

    const isMobile = useIsMobile();

    // Derive open state from search state
    const open = state?.open ?? false;

    // Close the pop-over when we switch to “ask” mode
    React.useEffect(() => {
        if (state?.ask && aiMode === CustomizationAIMode.Assistant) {
            setSearchState((prev) => (prev ? { ...prev, open: !state.ask } : prev));
        }
    }, [state?.ask, setSearchState, aiMode]);

    const onClose = React.useCallback(
        async (to?: string) => {
            if (state?.query === '') {
                await setSearchState(null);
            } else if (state) {
                await setSearchState({ ...state, open: false });
            }

            if (to) {
                router.push(to);
            }
        },
        [state, setSearchState, router]
    );

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            onOpen();
        },
        []
    );

    const onOpen = React.useCallback(() => {
        if (open) {
            return;
        }
        setSearchState((prev) => ({
            ask: null,
            global: prev?.global ?? false,
            query: (!withAIChat ? prev?.ask : null) ?? prev?.query ?? '',
            open: true,
        }));

        trackEvent({
            type: 'search_open',
        });
    }, [open, setSearchState, trackEvent, withAIChat]);

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
            ask: null, // When typing, we go back to the default search mode
            query: value,
            global: prev?.global ?? false,
            open: true,
        }));
    };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state?.query?.trim() ?? '';

    return (
        <SearchAskProvider value={searchAsk}>
            <Popover
                content={
                    // Only show content if there's a query or Ask is enabled
                    (state?.query || aiMode !== CustomizationAIMode.None) && open ? (
                        <React.Suspense fallback={null}>
                            {isMultiVariants && !state?.ask ? (
                                <SearchScopeToggle spaceTitle={spaceTitle} />
                            ) : null}
                            {state !== null && !state.ask ? (
                                <SearchResults
                                    ref={resultsRef}
                                    query={normalizedQuery}
                                    global={state?.global ?? false}
                                    aiMode={aiMode}
                                />
                            ) : null}
                            {state?.ask ? <SearchAskAnswer query={normalizedQuery} /> : null}
                        </React.Suspense>
                    ) : null
                }
                rootProps={{
                    open: open,
                    modal: isMobile,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        'bg-tint-base has-[.empty]:hidden scroll-py-2 w-[32rem] p-2 max-h-[min(32rem,var(--radix-popover-content-available-height))] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: (event) => {
                        // Don't close if clicking on the search input itself
                        if (searchInputRef.current?.contains(event.target as Node)) {
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
                    value={(!withAIChat ? state?.ask : null) ?? state?.query ?? ''}
                    onFocus={onOpen}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    aiMode={aiMode}
                    isOpen={open}
                    className={className}
                />
            </Popover>
        </SearchAskProvider>
    );
}
