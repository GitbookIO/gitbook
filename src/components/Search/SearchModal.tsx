'use client';

import IconSearch from '@geist-ui/icons/search';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { SearchAskAnswer } from './SearchAskAnswer';
import { SearchResults, SearchResultsRef } from './SearchResults';
import { SearchState, useSearch } from './useSearch';

interface SearchModalProps {
    spaceId: string;
    withAsk: boolean;
}

export function SearchModal(props: SearchModalProps) {
    const [state, setSearchState] = useSearch();

    useHotkeys(
        'ctrl+k, command+k',
        (e) => {
            e.preventDefault(); //might be inadvisable as it interferes with expected browser behavior.
            setSearchState({ ask: false, query: '' });
        },
        [],
    );

    // Add a global class on the body when the search modal is open
    const isSearchOpened = state !== null;
    React.useEffect(() => {
        if (isSearchOpened) {
            document.body.classList.add('search-open');
            Object.assign(document.body.style, {
                overflow: 'hidden',
            });
        }

        return () => {
            document.body.classList.remove('search-open');
            Object.assign(document.body.style, {
                overflow: 'auto',
            });
        };
    }, [isSearchOpened]);

    if (state === null) {
        return null;
    }

    const onChangeQuery = (newQuery: SearchState) => {
        setSearchState(newQuery);
    };

    const onClose = () => {
        setSearchState(null);
    };

    return (
        <div
            role="dialog"
            className={tcls(
                'flex',
                'items-start',
                'justify-center',
                'fixed',
                'inset-0',
                'bg-dark/4',
                'backdrop-blur-lg',
                'dark:bg-dark/9',
                'opacity-[1]',
                'z-30',
                'px-4',
                'pt-4',
                'md:pt-[min(8vw,_6rem)]',
            )}
            onClick={onClose}
        >
            <SearchModalBody
                {...props}
                state={state}
                onChangeQuery={onChangeQuery}
                onClose={onClose}
            />
        </div>
    );
}

function SearchModalBody(
    props: SearchModalProps & {
        state: SearchState;
        onChangeQuery: (newQuery: SearchState) => void;
        onClose: () => void;
    },
) {
    const { spaceId, withAsk, state, onChangeQuery, onClose } = props;

    const language = useLanguage();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
            onClose();
        } else if (event.key === 'ArrowUp') {
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

    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChangeQuery({
            ask: false, // When typing, we go back to the default search mode
            query: event.target.value,
        });
    };

    return (
        <div
            role="dialog"
            aria-label={tString(language, 'search')}
            className={tcls(
                'flex',
                'flex-col',
                'bg-white',
                'max-w-[720px]',
                'w-full',
                'max-h',
                'rounded-3xl',
                'ring-1',
                'ring-dark/1',
                'shadow-1xs',
                'overflow-hidden',
                'dark:[background-color:color-mix(in_srgb,_rgb(var(--dark)),_rgb(var(--light))_4%)]',
                'dark:ring-light/2',
            )}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className={tcls('flex', 'flex-row', 'items-center')}>
                <div className={tcls('text-dark/4', 'p-3', 'dark:text-light/5')}>
                    <IconSearch className={tcls('w-6', 'h-6')} />
                </div>
                <div className={tcls('flex-1')}>
                    <textarea
                        ref={inputRef}
                        value={state.query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls(
                            'text-dark',
                            'flex',
                            'resize-none',
                            'w-full',
                            'h-12',
                            'p-2',
                            'pt-3',
                            'focus:outline-none',
                            'bg-transparent',
                            'whitespace-pre-line',
                            'dark:text-white',
                        )}
                        placeholder={tString(language, 'search_input_placeholder')}
                        rows={1}
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                </div>
            </div>
            {!state.ask || !withAsk ? (
                <SearchResults
                    ref={resultsRef}
                    spaceId={spaceId}
                    query={state.query}
                    withAsk={withAsk}
                    onSwitchToAsk={() => {
                        onChangeQuery({
                            ask: true,
                            query: state.query,
                        });
                    }}
                />
            ) : null}
            {state.query && state.ask && withAsk ? (
                <SearchAskAnswer spaceId={spaceId} query={state.query} />
            ) : null}
        </div>
    );
}
