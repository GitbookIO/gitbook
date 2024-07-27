'use client';

import { Collection, Site } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilValue } from 'recoil';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { SearchAskAnswer, searchAskState } from './SearchAskAnswer';
import { SearchResults, SearchResultsRef } from './SearchResults';
import { SearchScopeToggle } from './SearchScopeToggle';
import { SearchState, useSearch } from './useSearch';
import { LoadingPane } from '../primitives/LoadingPane';

interface SearchModalProps {
    spaceId: string;
    revisionId: string;
    spaceTitle: string;
    parent: Site | Collection | null;
    withAsk: boolean;
}

/**
 * Client component to render the search modal when the url contains a search query.
 */
export function SearchModal(props: SearchModalProps) {
    const [state, setSearchState] = useSearch();
    const askState = useRecoilValue(searchAskState);
    const router = useRouter();

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            setSearchState({ ask: false, query: '', global: false });
        },
        [],
    );

    // Add a global class on the body when the search modal is open
    const isSearchOpened = state !== null;
    React.useEffect(() => {
        if (isSearchOpened) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSearchOpened]);

    if (state === null) {
        return null;
    }

    const onChangeQuery = (newQuery: SearchState) => {
        setSearchState(newQuery);
    };

    const onClose = async (to?: string) => {
        await setSearchState(null);
        if (to) {
            router.push(to);
        }
    };

    return (
        <>
            <div
                role="dialog"
                className={tcls(
                    'flex',
                    'items-start',
                    'justify-center',
                    'fixed',
                    'inset-0',
                    'bg-dark/4',
                    'backdrop-blur-2xl',
                    'opacity-[1]',
                    'z-30',
                    'px-4',
                    'pt-4',
                    'dark:bg-dark/8',
                    'md:pt-[min(8vw,_6rem)]',
                )}
                onClick={() => {
                    onClose();
                }}
            >
                <AnimatePresence>
                    {askState?.type === 'loading' ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className={tcls(
                                'w-[100vw]',
                                'h-[100vh]',
                                'fixed',
                                'inset-0',
                                'z-10',
                                'pointer-events-none',
                            )}
                        >
                            <LoadingPane
                                gridStyle={['h-[100vh]', 'aspect-auto', 'top-[-30%]']}
                                pulse
                                tile={96}
                                style={['grid']}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <SearchModalBody
                    {...props}
                    state={state}
                    onChangeQuery={onChangeQuery}
                    onClose={onClose}
                />
            </div>
        </>
    );
}

function SearchModalBody(
    props: SearchModalProps & {
        state: SearchState;
        onChangeQuery: (newQuery: SearchState) => void;
        onClose: (to?: string) => void;
    },
) {
    const { spaceId, revisionId, spaceTitle, withAsk, parent, state, onChangeQuery, onClose } =
        props;

    const language = useLanguage();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChangeQuery({
            ask: false, // When typing, we go back to the default search mode
            query: event.target.value,
            global: state.global,
        });
    };

    return (
        <div
            role="dialog"
            aria-label={tString(language, 'search')}
            className={tcls(
                'z-40',
                'flex',
                'flex-col',
                'bg-white',
                'max-w-[768px]',
                'mt-[-1px]',
                'w-full',
                'max-h',
                'rounded-lg',
                'ring-1',
                'ring-dark/1',
                'shadow-2xl',
                'backdrop-blur-lg',
                'overflow-hidden',
                'dark:ring-inset',
                'dark:bg-dark-3',
                'dark:ring-light/2',
            )}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className={tcls('flex', 'flex-row', 'items-center')}>
                <div className={tcls('p-2', 'pl-4')}>
                    <Icon icon="magnifying-glass" className={tcls('size-4', 'text-dark/4', 'dark:text-light/5')} />
                </div>
                <div className={tcls('flex-1')}>
                    <input
                        ref={inputRef}
                        value={state.query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls(
                            'text-dark',
                            'placeholder:text-dark/7',
                            'flex',
                            'resize-none',
                            'w-full',
                            'h-12',
                            'p-2',
                            'focus:outline-none',
                            'bg-transparent',
                            'whitespace-pre-line',
                            'dark:text-light',
                            'dark:placeholder:text-light/7',
                        )}
                        placeholder={tString(
                            language,
                            withAsk ? 'search_ask_input_placeholder' : 'search_input_placeholder',
                        )}
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
                    revisionId={revisionId}
                    parent={state.global ? parent : null}
                    query={state.query}
                    withAsk={withAsk}
                    onSwitchToAsk={() => {
                        onChangeQuery({
                            ask: true,
                            query: state.query,
                            global: state.global,
                        });
                    }}
                >
                    {parent && state.query ? <SearchScopeToggle spaceTitle={spaceTitle} /> : null}
                </SearchResults>
            ) : null}
            {state.query && state.ask && withAsk ? (
                <SearchAskAnswer spaceId={spaceId} query={state.query} />
            ) : null}
        </div>
    );
}
