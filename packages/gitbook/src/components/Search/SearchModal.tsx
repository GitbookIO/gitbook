'use client';

import { Icon } from '@gitbook/icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilValue } from 'recoil';

import { tString, useLanguage } from '@/intl/client';
import { SiteContentPointer } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SearchAskAnswer, searchAskState } from './SearchAskAnswer';
import { SearchResults, SearchResultsRef } from './SearchResults';
import { SearchScopeToggle } from './SearchScopeToggle';
import { SearchState, UpdateSearchState, useSearch } from './useSearch';
import { LoadingPane } from '../primitives/LoadingPane';

interface SearchModalProps {
    spaceId: string;
    revisionId: string;
    spaceTitle: string;
    isMultiVariants: boolean;
    withAsk: boolean;
    pointer: SiteContentPointer;
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

    const onClose = async (to?: string) => {
        await setSearchState(null);
        if (to) {
            router.push(to);
        }
    };

    return (
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
                        'bg-dark/4',
                        'backdrop-blur-2xl',
                        'z-30',
                        'px-4',
                        'pt-4',
                        'dark:bg-dark/8',
                        'md:pt-[min(8vh,6rem)]',
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
                                        'pointer-events-none',
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
    );
}

function SearchModalBody(
    props: SearchModalProps & {
        state: SearchState;
        setSearchState: UpdateSearchState;
        onClose: (to?: string) => void;
    },
) {
    const {
        pointer,
        spaceId,
        revisionId,
        spaceTitle,
        withAsk,
        isMultiVariants,
        state,
        setSearchState,
        onClose,
    } = props;

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
                'bg-white',
                'max-w-prose',
                'mx-auto',
                'max-h-[70dvh]',
                'w-full',
                'rounded-lg',
                'straight-corners:rounded-sm',
                'ring-1',
                'ring-dark/1',
                'shadow-2xl',
                'overflow-hidden',
                'dark:ring-inset',
                'dark:bg-dark-3',
                'dark:ring-light/2',
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
                    'border-dark/2',
                    'dark:border-light/2',
                )}
            >
                <div className={tcls('p-2', 'pl-4', 'pt-4')}>
                    <Icon
                        icon="magnifying-glass"
                        className={tcls('size-4', 'text-dark/4', 'dark:text-light/5')}
                    />
                </div>
                <div
                    className={tcls(
                        'w-full',
                        'flex',
                        'flex-row',
                        'flex-wrap',
                        'gap-y-0',
                        'gap-x-4',
                        'items-end',
                    )}
                >
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
                            'flex-1',
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
                    {isMultiVariants ? <SearchScopeToggle spaceTitle={spaceTitle} /> : null}
                </div>
            </div>
            {!state.ask || !withAsk ? (
                <SearchResults
                    ref={resultsRef}
                    pointer={pointer}
                    spaceId={spaceId}
                    revisionId={revisionId}
                    global={isMultiVariants && state.global}
                    query={state.query}
                    withAsk={withAsk}
                    onSwitchToAsk={() => {
                        setSearchState((state) => (state ? { ...state, ask: true } : null));
                    }}
                ></SearchResults>
            ) : null}
            {state.query && state.ask && withAsk ? (
                <SearchAskAnswer pointer={pointer} query={state.query} />
            ) : null}
        </motion.div>
    );
}
