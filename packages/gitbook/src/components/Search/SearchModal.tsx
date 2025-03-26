'use client';

import { Icon } from '@gitbook/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { LoadingPane } from '../primitives/LoadingPane';
import { SearchAskAnswer } from './SearchAskAnswer';
import { SearchAskProvider, useSearchAskState } from './SearchAskContext';
import { SearchResults, type SearchResultsRef } from './SearchResults';
import { SearchScopeToggle } from './SearchScopeToggle';
import { type SearchState, type UpdateSearchState, useSearch } from './useSearch';

interface SearchModalProps {
    spaceTitle: string;
    isMultiVariants: boolean;
    withAsk: boolean;
}

/**
 * Client component to render the search modal when the url contains a search query.
 */
export function SearchModal(props: SearchModalProps) {
    const [state, setSearchState] = useSearch();
    const searchAsk = useSearchAskState();
    const [askState] = searchAsk;
    const router = useRouter();

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            setSearchState({ ask: false, query: '', global: false });
        },
        []
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

    const onClose = async (to?: string) => {
        await setSearchState(null);
        if (to) {
            router.push(to);
        }
    };

    return (
        <SearchAskProvider value={searchAsk}>
            <AnimatePresence>
                {state !== null ? (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.2,
                            delay: 0.1,
                        }}
                        role="dialog"
                        className={tcls(
                            'fixed',
                            'inset-0',
                            'bg-tint-12/4',
                            'dark:bg-tint-1/6',
                            'backdrop-blur-2xl',
                            'z-50',
                            'px-4',
                            'pt-4',
                            'md:pt-[min(8vh,6rem)]'
                        )}
                        onClick={() => {
                            onClose();
                        }}
                    >
                        <div className="scroll-nojump">
                            <AnimatePresence>
                                {askState?.type === 'loading' ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1 }}
                                        className={tcls(
                                            'w-screen',
                                            'h-screen',
                                            'fixed',
                                            'inset-0',
                                            'z-10',
                                            'pointer-events-none'
                                        )}
                                    >
                                        <LoadingPane
                                            gridStyle={['h-screen', 'aspect-auto', 'top-[-30%]']}
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
                                setSearchState={setSearchState}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </SearchAskProvider>
    );
}

function SearchModalBody(
    props: SearchModalProps & {
        state: SearchState;
        setSearchState: UpdateSearchState;
        onClose: (to?: string) => void;
    }
) {
    const { spaceTitle, withAsk, isMultiVariants, state, setSearchState, onClose } = props;

    const language = useLanguage();
    const resultsRef = React.useRef<SearchResultsRef>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

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
            global: state.global,
        });
    };

    const onSwitchToAsk = () => {
        setSearchState((state) => (state ? { ...state, ask: true } : null));
    };

    // We trim the query to avoid invalidating the search when the user is typing between words.
    const normalizedQuery = state.query.trim();

    return (
        <motion.div
            transition={{
                duration: 0.2,
                delay: 0.1,
                ease: 'easeOut',
            }}
            initial={{
                scale: 0.95,
                opacity: 0,
            }}
            animate={{
                scale: 1,
                opacity: 1,
            }}
            exit={{
                scale: 0.95,
                opacity: 0,
            }}
            role="dialog"
            aria-label={tString(language, 'search')}
            className={tcls(
                'z-40',
                'relative',
                'flex',
                'flex-col',
                'bg-tint-base',
                'max-w-prose',
                'mx-auto',
                'max-h-[70dvh]',
                'w-full',
                'rounded-lg',
                'straight-corners:rounded-sm',
                'ring-1',
                'ring-tint-hover',
                'shadow-2xl',
                'overflow-hidden',
                'dark:ring-inset',
                'dark:ring-tint'
            )}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    'items-start',
                    state.query !== null ? 'border-b' : null,
                    'border-tint-subtle'
                )}
            >
                <div className={tcls('p-2', 'pl-4', 'pt-4')}>
                    <Icon icon="magnifying-glass" className={tcls('size-4', 'text-tint-subtle')} />
                </div>
                <div
                    className={tcls(
                        'w-full',
                        'flex',
                        'flex-row',
                        'flex-wrap',
                        'gap-y-0',
                        'gap-x-4',
                        'items-end'
                    )}
                >
                    <input
                        ref={inputRef}
                        value={state.query}
                        onKeyDown={onKeyDown}
                        onChange={onChange}
                        className={tcls(
                            'text-tint-strong',
                            'placeholder:text-tint',
                            'flex',
                            'resize-none',
                            'flex-1',
                            'h-12',
                            'p-2',
                            'focus:outline-none',
                            'bg-transparent',
                            'whitespace-pre-line'
                        )}
                        placeholder={tString(
                            language,
                            withAsk ? 'search_ask_input_placeholder' : 'search_input_placeholder'
                        )}
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                    {isMultiVariants ? <SearchScopeToggle spaceTitle={spaceTitle} /> : null}
                </div>
            </div>
            {!state.ask || !withAsk ? (
                <SearchResults
                    ref={resultsRef}
                    global={isMultiVariants && state.global}
                    query={normalizedQuery}
                    withAsk={withAsk}
                    onSwitchToAsk={onSwitchToAsk}
                />
            ) : null}
            {normalizedQuery && state.ask && withAsk ? (
                <SearchAskAnswer query={normalizedQuery} />
            ) : null}
        </motion.div>
    );
}
