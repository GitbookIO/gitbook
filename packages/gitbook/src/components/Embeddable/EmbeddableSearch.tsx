'use client';

import {
    type SearchBaseProps,
    SearchFrame,
    SearchInput,
    SearchLiveResultsAnnouncer,
    SearchScopeControl,
    useSearchController,
} from '@/components/Search';
import React from 'react';
import { useTrackEvent } from '../Insights';
import { LinkContext } from '../primitives';
import {
    EmbeddableIframeButtons,
    EmbeddableIframeCloseButton,
    EmbeddableIframeTabs,
    useEmbeddableLinkContext,
} from './EmbeddableIframeAPI';

type EmbeddableSearchProps = {
    baseURL: string;
    siteTitle: string;
    searchProps: SearchBaseProps;
};

export function EmbeddableSearch(props: EmbeddableSearchProps) {
    const { baseURL, searchProps, siteTitle } = props;
    const { hasDocsTab, linkContext } = useEmbeddableLinkContext();

    const trackEvent = useTrackEvent();
    React.useEffect(() => {
        trackEvent({
            type: 'search_open',
        });
    }, [trackEvent]);

    const tabsRef = React.useRef<HTMLDivElement>(null);
    const {
        askQuery,
        cursor,
        error,
        fetching,
        onInputKeyDown,
        query,
        results,
        resultsId,
        resultsRef,
        searchValue,
        setQuery,
        showAsk,
        withSearchAI,
        scopeControl,
    } = useSearchController({ ...searchProps, asEmbeddable: hasDocsTab });

    return (
        <LinkContext value={linkContext}>
            <SearchFrame
                asEmbeddable={hasDocsTab}
                askQuery={askQuery}
                cursor={cursor}
                error={error}
                fetching={fetching}
                query={query}
                results={results}
                resultsId={resultsId}
                resultsRef={resultsRef}
                showAsk={showAsk}
                dataTestId="embed-search"
                input={
                    <SearchInput
                        aria-activedescendant={
                            cursor !== null ? `${resultsId}-${cursor}` : undefined
                        }
                        aria-controls={resultsId}
                        onChange={setQuery}
                        onKeyDown={onInputKeyDown}
                        value={searchValue}
                        withAI={withSearchAI}
                        isOpen={true}
                        mode="frame"
                    >
                        <SearchLiveResultsAnnouncer
                            count={results.length}
                            showing={Boolean(searchValue) && !fetching}
                        />
                    </SearchInput>
                }
                sidebar={
                    <>
                        <EmbeddableIframeTabs
                            ref={tabsRef}
                            active="search"
                            baseURL={baseURL}
                            siteTitle={siteTitle}
                        />
                        <EmbeddableIframeButtons />
                        <EmbeddableIframeCloseButton />
                    </>
                }
                scopeControl={
                    searchProps.withVariants || searchProps.withSections ? (
                        <SearchScopeControl {...scopeControl} />
                    ) : null
                }
            />
        </LinkContext>
    );
}
