'use client';

import React from 'react';

import { useAI } from '../AI';
import {
    EmbeddableFrame,
    EmbeddableFrameHeader,
    EmbeddableFrameMain,
    EmbeddableFrameSidebar,
} from '../Embeddable/EmbeddableFrame';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SearchAskAnswer } from './SearchAskAnswer';
import { SearchAskBar } from './SearchAskBar';
import { SearchAskProvider, useSearchAskState } from './SearchAskContext';
import { SearchResults, type SearchResultsRef } from './SearchResults';
import type { ResultType } from './useSearchResults';
import { type ClassValue, tcls } from '@/lib/tailwind';
export function SearchFrame(props: {
    asEmbeddable?: boolean;
    askQuery: string;
    cursor: number | null;
    error: boolean;
    fetching: boolean;
    fillHeight?: boolean;
    input?: React.ReactNode;
    query: string;
    results: ResultType[];
    resultsId: string;
    resultsRef: React.Ref<SearchResultsRef>;
    onResultSelect?: () => void;
    /** Select the result under the mouse, so hover and keyboard share one highlight. */
    onResultHover?: (index: number) => void;
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
        fillHeight = false,
        input,
        query,
        results,
        resultsId,
        resultsRef,
        onResultSelect,
        onResultHover,
        scopeControl,
        showAsk,
        sidebar,
    } = props;

    const searchAsk = useSearchAskState();
    const { assistants } = useAI();

    return (
        <SearchAskProvider value={searchAsk}>
            <EmbeddableFrame
                className={tcls(
                    'min-h-0 bg-tint-base from-transparent to-transparent',
                    fillHeight ? 'h-full' : '',
                    className
                )}
            >
                {sidebar ? <EmbeddableFrameSidebar>{sidebar}</EmbeddableFrameSidebar> : null}
                <EmbeddableFrameMain className="min-h-0" data-testid={dataTestId}>
                    <div
                        className={tcls(
                            'pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden',
                            fetching ? 'block animate-fade-in' : 'hidden animate-fade-out-slow'
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
                    {input ? (
                        <EmbeddableFrameHeader className="p-3 pb-0">{input}</EmbeddableFrameHeader>
                    ) : null}
                    <React.Suspense fallback={null}>
                        <div
                            className={tcls(
                                'flex flex-col overflow-hidden',
                                fillHeight ? 'min-h-0 flex-1' : ''
                            )}
                        >
                            <ScrollContainer
                                orientation="vertical"
                                className={tcls(fillHeight ? 'min-h-0 flex-1' : '')}
                                leading={{ fade: 'long', button: false }}
                                trailing={{
                                    fade: 'long',
                                    button: true,
                                    // Loading placeholders are not more results.
                                    buttonAlwaysVisible: results.length > 0,
                                }}
                                contentClassName={tcls(
                                    // Keeps the keyboard selection clear of the faded edges.
                                    'gutter-stable scroll-pt-12 scroll-pb-24 p-3',
                                    fillHeight ? 'min-h-full' : ''
                                )}
                            >
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
                                        onResultHover={onResultHover}
                                    />
                                )}
                            </ScrollContainer>
                            {!showAsk && query && assistants.length > 0
                                ? assistants.map((assistant, index) => (
                                      <SearchAskBar
                                          key={assistant.id}
                                          query={query}
                                          assistant={assistant}
                                          active={cursor === results.length + index}
                                          onHover={() => onResultHover?.(results.length + index)}
                                          onSelect={onResultSelect}
                                      />
                                  ))
                                : null}
                            {scopeControl && !showAsk ? (
                                <div className="flex gap-2 border-t border-tint-subtle bg-tint-subtle px-4 py-1.5">
                                    {scopeControl}
                                </div>
                            ) : null}
                        </div>
                    </React.Suspense>
                </EmbeddableFrameMain>
            </EmbeddableFrame>
        </SearchAskProvider>
    );
}
