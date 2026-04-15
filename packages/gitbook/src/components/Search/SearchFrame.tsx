'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import React from 'react';
import {
    EmbeddableFrame,
    EmbeddableFrameHeader,
    EmbeddableFrameMain,
    EmbeddableFrameSidebar,
} from '../Embeddable/EmbeddableFrame';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SearchAskAnswer } from './SearchAskAnswer';
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
        scopeControl,
        showAsk,
        sidebar,
    } = props;

    const searchAsk = useSearchAskState();

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
                        <ScrollContainer orientation="vertical" contentClassName="p-3">
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
                                />
                            )}
                        </ScrollContainer>
                        {scopeControl && !showAsk ? (
                            <div className="border-tint-subtle border-t bg-tint-subtle px-4 py-1.5">
                                {scopeControl}
                            </div>
                        ) : null}
                    </React.Suspense>
                </EmbeddableFrameMain>
            </EmbeddableFrame>
        </SearchAskProvider>
    );
}
