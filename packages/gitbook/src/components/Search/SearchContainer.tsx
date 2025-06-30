'use client';

import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useTrackEvent } from '../Insights';
import { Popover } from '../primitives';
import { useSearchAskState } from './SearchAskContext';
import { SearchAskProvider } from './SearchAskContext';
import { SearchButton } from './SearchButton';
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
    const searchAsk = useSearchAskState();
    // const [askState] = searchAsk;
    const router = useRouter();
    const trackEvent = useTrackEvent();
    const resultsRef = useRef<SearchResultsRef>(null);

    const onClose = async (to?: string) => {
        await setSearchState(null);
        if (to) {
            router.push(to);
        }
    };

    const onOpen = () => {
        setSearchState({
            ask: false,
            global: false,
            query: state?.query ?? '',
        });

        trackEvent({
            type: 'search_open',
        });
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

    // const onSwitchToAsk = () => {
    //     setSearchState((state) => (state ? { ...state, ask: true } : null));
    // };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state?.query.trim() ?? '';

    return (
        <SearchAskProvider value={searchAsk}>
            <Popover
                content={
                    <React.Suspense fallback={null}>
                        {state !== null ? (
                            <SearchResults
                                ref={resultsRef}
                                query={normalizedQuery}
                                global={state?.global ?? false}
                                withAsk={withAsk}
                                withAIChat={withAIChat}
                                onSwitchToAsk={() => {}}
                            />
                        ) : null}
                    </React.Suspense>
                }
                rootProps={{
                    open: state !== null,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        'bg-tint-base w-[32rem] p-3 h-[32rem] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: () => onClose(),
                    sideOffset: 8,
                }}
                triggerProps={{
                    className: 'grow',
                }}
            >
                <SearchButton
                    value={state?.query ?? ''}
                    onFocus={onOpen}
                    onBlur={onClose}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    withAsk={withAsk}
                />
            </Popover>
        </SearchAskProvider>
    );
}
