'use client';

import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTrackEvent } from '../Insights';
import { Popover } from '../primitives';
import { SearchAskAnswer } from './SearchAskAnswer';
import { useSearchAskState } from './SearchAskContext';
import { SearchAskProvider } from './SearchAskContext';
import { SearchInput } from './SearchInput';
import { SearchResults, type SearchResultsRef } from './SearchResults';
import { useSearch } from './useSearch';

interface SearchContainerProps {
    spaceTitle: string;
    isMultiVariants: boolean;
    withAsk: boolean;
    withAIChat: boolean;
}

/**
 * Client component to render the search modal when the url contains a search query.
 */
export function SearchContainer(props: SearchContainerProps) {
    const { withAsk, withAIChat } = props;

    const [state, setSearchState] = useSearch();
    const [open, setOpen] = useState(false);
    const searchAsk = useSearchAskState();
    // const [askState] = searchAsk;
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = useRef<SearchResultsRef>(null);

    const onClose = async (to?: string) => {
        if (!state?.query) {
            await setSearchState(null);
        }
        setOpen(false);

        if (to) {
            router.push(to);
        }
    };

    React.useEffect(() => {
        if (state === null) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [state]);

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            onOpen();
        },
        []
    );

    const onOpen = () => {
        if (withAsk || state?.query !== '') {
            setSearchState({
                ask: false,
                global: false,
                query: state?.query ?? '',
            });
            setOpen(true);

            trackEvent({
                type: 'search_open',
            });
        }
    };

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

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchState({
            ask: false, // When typing, we go back to the default search mode
            query: event.target.value,
            global: state?.global ?? false,
        });
    };

    const onSwitchToAsk = () => {
        setSearchState((state) => (state ? { ...state, ask: true } : null));
    };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state?.query.trim() ?? '';

    return (
        <SearchAskProvider value={searchAsk}>
            <Popover
                content={
                    <React.Suspense fallback={null}>
                        {state !== null && !state.ask ? (
                            <SearchResults
                                ref={resultsRef}
                                query={normalizedQuery}
                                global={state?.global ?? false}
                                withAsk={withAsk}
                                withAIChat={withAIChat}
                                onSwitchToAsk={onSwitchToAsk}
                            />
                        ) : null}
                        {state?.ask ? <SearchAskAnswer query={normalizedQuery} /> : null}
                    </React.Suspense>
                }
                rootProps={{
                    open: open,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        'bg-tint-base has-[.empty]:hidden scroll-py-6 w-[32rem] p-2 max-h-[min(32rem,var(--radix-popover-content-available-height))] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: () => onClose(),
                    sideOffset: 8,
                }}
                triggerProps={{
                    asChild: true,
                }}
            >
                <div className="flex grow">
                    <SearchInput
                        value={state?.query}
                        onFocus={onOpen}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        withAsk={withAsk}
                        isOpen={open}
                    />
                </div>
            </Popover>
        </SearchAskProvider>
    );
}
