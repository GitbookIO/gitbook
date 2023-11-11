'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { tcls } from '@/lib/tailwind';
import { useSearch } from './useSearch';
import React from 'react';
import IconSearch from '@geist-ui/icons/search';

export function SearchModal(props: {}) {
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
                'bg-zinc-400/25',
                'backdrop-blur-sm',
                'dark:bg-black/40',
                'opacity-100',
                'z-30',
                'pt-24',
            )}
            onClick={onClose}
        >
            <SearchModalBody query={query} onChangeQuery={onChangeQuery} onClose={onClose} />
        </div>
    );
}

function SearchModalBody(props: {
    query: string;
    onChangeQuery: (newQuery: string) => void;
    onClose: () => void;
}) {
    const { query, onChangeQuery, onClose } = props;

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape' || (event.key === 'Backspace' && query === '')) {
            onClose();
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
                'w-[500px]',
                'max-h',
                'rounded',
                'border-slate-500',
                'shadow-lg',
                'overflow-hidden',
            )}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className={tcls('flex', 'flex-row', 'items-center')}>
                <div className={tcls('text-slate-400', 'p-3')}>
                    <IconSearch className={tcls('w-6', 'h-6')} />
                </div>
                <div className={tcls('flex-1')}>
                    <input
                        ref={inputRef}
                        value={query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls('w-full', 'p-2', 'text-slate-600', 'focus:outline-none')}
                    />
                </div>
            </div>
        </div>
    );
}
