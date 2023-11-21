'use client';

import IconSearch from '@geist-ui/icons/search';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { tcls } from '@/lib/tailwind';

import { SearchResults, SearchResultsRef } from './SearchResults';
import { useSearch } from './useSearch';

interface SearchModalProps {
    spaceId: string;
    inputPlaceholder: string;
    noResultsMessage: string;
}

export function SearchModal(props: SearchModalProps) {
    const [query, setQuery] = useSearch();

    useHotkeys(
        'ctrl+k, command+k',
        () => {
            setQuery('');
        },
        [],
    );

    if (query === null) {
        return null;
    }

    const onChangeQuery = (newQuery: string) => {
        setQuery(newQuery);
    };

    const onClose = () => {
        setQuery(null);
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
                'opacity-100',
                'z-30',
                'pt-24',
            )}
            onClick={onClose}
        >
            <SearchModalBody
                {...props}
                query={query}
                onChangeQuery={onChangeQuery}
                onClose={onClose}
            />
        </div>
    );
}

function SearchModalBody(
    props: SearchModalProps & {
        query: string;
        onChangeQuery: (newQuery: string) => void;
        onClose: () => void;
    },
) {
    const { spaceId, inputPlaceholder, noResultsMessage, query, onChangeQuery, onClose } = props;

    const resultsRef = React.useRef<SearchResultsRef>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape' || (event.key === 'Backspace' && query === '')) {
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
        onChangeQuery(event.target.value);
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
                'border-slate-500',
                'shadow-lg',
                'overflow-hidden',
                'dark:bg-metal',
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
                        value={query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls(
                            'w-full',
                            'p-2',
                            'text-dark',
                            'focus:outline-none',
                            'bg-transparent',
                        )}
                        placeholder={inputPlaceholder}
                    />
                </div>
            </div>
            {query ? (
                <SearchResults
                    ref={resultsRef}
                    spaceId={spaceId}
                    query={query}
                    noResultsMessage={noResultsMessage}
                />
            ) : null}
        </div>
    );
}
