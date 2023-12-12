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
            className={tcls(
                'flex',
                'items-start',
                'justify-center',
                'fixed',
                'inset-0',
                'bg-dark/4',
                'backdrop-blur',
                'dark:bg-dark/9',
                'opacity-[1]',
                'z-30',
                'px-4',
                'pt-4',
                'md:pt-[min(12vw,_10rem)]',
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
    const { spaceId, state, onChangeQuery, onClose } = props;

    const language = useLanguage();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape' || (event.key === 'Backspace' && state.query === '')) {
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

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeQuery({
            ask: false, // When typing, we go back to the default search mode
            query: event.target.value,
        });
    };

    return (
        <div
            role="dialog"
            className={tcls(
                'flex',
                'flex-col',
                'bg-white',
                'w-[600px]',
                'max-h',
                'rounded-3xl',
                'border-dark/2',
                'shadow-1xs',
                'overflow-hidden',
                'dark:bg-metal',
                'dark:border-light/3',
                'dark:shadow-vanta',
            )}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className={tcls('flex', 'flex-row', 'items-center', 'border-b', 'border-dark/2')}>
                <div className={tcls('text-dark/4', 'p-3')}>
                    <IconSearch className={tcls('w-6', 'h-6')} />
                </div>
                <div className={tcls('flex-1')}>
                    <input
                        ref={inputRef}
                        value={state.query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls(
                            'w-full',
                            'p-2',
                            'text-dark',
                            'focus:outline-none',
                            'bg-transparent',
                        )}
                        placeholder={tString(language, 'search_input_placeholder')}
                    />
                </div>
            </div>
            {state.query && !state.ask ? (
                <SearchResults
                    ref={resultsRef}
                    spaceId={spaceId}
                    query={state.query}
                    onSwitchToAsk={() => {
                        onChangeQuery({
                            ask: true,
                            query: state.query,
                        });
                    }}
                />
            ) : null}
            {state.query && state.ask ? (
                <SearchAskAnswer spaceId={spaceId} query={state.query} />
            ) : null}
        </div>
    );
}
