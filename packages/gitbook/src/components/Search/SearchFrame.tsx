'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import React from 'react';
import { useAI } from '../AI';
import {
    EmbeddableFrame,
    EmbeddableFrameHeader,
    EmbeddableFrameMain,
    EmbeddableFrameSidebar,
} from '../Embeddable/EmbeddableFrame';
import { Tooltip } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SearchAskAnswer } from './SearchAskAnswer';
import { SearchAskBar } from './SearchAskBar';
import { SearchAskProvider, useSearchAskState } from './SearchAskContext';
import { SearchResults, type SearchResultsRef } from './SearchResults';
import type { ResultType } from './useSearchResults';
export function SearchFrame(props: {
    asEmbeddable?: boolean;
    askQuery: string;
    cursor: number | null;
    error: boolean;
    fetching: boolean;
    input?: React.ReactNode;
    query: string;
    results: ResultType[];
    resultsId: string;
    resultsRef: React.Ref<SearchResultsRef>;
    onResultSelect?: () => void;
    scopeControl?: React.ReactNode;
    showAsk: boolean;
    sidebar?: React.ReactNode;
    className?: ClassValue;
    dataTestId?: string;
}) {
    const {
        askQuery,
        asEmbeddable,
        className,
        cursor,
        dataTestId,
        error,
        fetching,
        input,
        query,
        results,
        resultsId,
        resultsRef,
        onResultSelect,
        scopeControl,
        showAsk,
        sidebar,
    } = props;

    const searchAsk = useSearchAskState();
    const { assistants } = useAI();

    return (
        <SearchAskProvider value={searchAsk}>
            <EmbeddableFrame
                className={tcls('bg-tint-base from-transparent to-transparent', className)}
            >
                {sidebar ? <EmbeddableFrameSidebar>{sidebar}</EmbeddableFrameSidebar> : null}
                <EmbeddableFrameMain data-testid={dataTestId}>
                    {input ? (
                        <EmbeddableFrameHeader className="p-3 pb-0">{input}</EmbeddableFrameHeader>
                    ) : null}
                    <React.Suspense fallback={null}>
                        <ScrollContainer
                            orientation="vertical"
                            contentClassName="gutter-stable p-3"
                        >
                            <div
                                className={tcls(
                                    'pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden',
                                    fetching
                                        ? 'block animate-fade-in'
                                        : 'hidden animate-fade-out-slow'
                                )}
                                style={{
                                    animationDelay: fetching ? '2s' : undefined,
                                }}
                            >
                                <div
                                    className={tcls(
                                        'h-full w-full origin-left animate-crawl bg-primary-solid'
                                    )}
                                />
                            </div>
                            {showAsk ? (
                                <SearchAskAnswer query={askQuery} asEmbeddable={asEmbeddable} />
                            ) : (
                                <SearchResults
                                    ref={resultsRef}
                                    query={query}
                                    id={resultsId}
                                    fetching={fetching}
                                    results={results}
                                    cursor={cursor}
                                    error={error}
                                    onResultSelect={onResultSelect}
                                />
                            )}
                        </ScrollContainer>
                        {!showAsk && query && assistants.length > 0
                            ? assistants.map((assistant) => (
                                  <SearchAskBar
                                      key={assistant.id}
                                      query={query}
                                      assistant={assistant}
                                  />
                              ))
                            : null}
                        <div
                            className={tcls(
                                'flex gap-2 border-tint-subtle border-t bg-tint-subtle px-4 py-1.5',
                                !scopeControl ? 'not-pointer-fine:hidden' : '',
                                showAsk ? 'hidden' : ''
                            )}
                        >
                            {scopeControl && !showAsk ? scopeControl : null}
                            <SearchFrameKeyboardHints />
                        </div>
                    </React.Suspense>
                </EmbeddableFrameMain>
            </EmbeddableFrame>
        </SearchAskProvider>
    );
}

const SearchFrameKeyboardHints = () => {
    return (
        <div className="@container/keyboard-hint flex not-pointer-fine:hidden w-full items-center justify-end py-1.5">
            {/* Compact view */}
            <div className="flex @max-[6rem]/keyboard-hint:hidden @min-[12rem]/keyboard-hint:hidden items-center gap-2">
                <Tooltip label="Navigate">
                    <div>
                        <KeyboardShortcut className="bg-tint-base" keys={['up', 'down']} />
                    </div>
                </Tooltip>
                /
                <Tooltip label="Close">
                    <div>
                        <KeyboardShortcut className="bg-tint-base" keys={['esc']} />
                    </div>
                </Tooltip>
            </div>
            {/* Normal view */}
            <div className="flex @max-[12rem]/keyboard-hint:hidden items-center gap-2">
                <KeyboardShortcut className="bg-tint-base" keys={['up', 'down']} />
                Navigate
                <KeyboardShortcut className="ml-1 bg-tint-base" keys={['esc']} />
                Close
            </div>
        </div>
    );
};
