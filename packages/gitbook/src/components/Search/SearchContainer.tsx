'use client';

import { CustomizationSearchStyle } from '@gitbook/api';
import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AIChatButton } from '../AIChat';
import { useIsMobile } from '../hooks/useIsMobile';
import { Popover } from '../primitives';
import { SearchFrame } from './SearchFrame';
import { SearchInput } from './SearchInput';
import { SearchLiveResultsAnnouncer } from './SearchLiveResultsAnnouncer';
import { SearchScopeControl } from './SearchScopeControl';
import type { SearchBaseProps } from './search-props';
import { useSearchController } from './useSearchController';

interface SearchContainerProps extends SearchBaseProps {
    style: CustomizationSearchStyle;
    className?: string;
    viewport?: 'desktop' | 'mobile';
}

/**
 * Client component to render the search input and results.
 */
export function SearchContainer({
    style,
    className,
    viewport,
    ...searchProps
}: SearchContainerProps) {
    const searchInputRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const {
        assistants,
        askQuery,
        close,
        cursor,
        error,
        fetching,
        onInputKeyDown,
        open,
        query,
        results,
        resultsId,
        resultsRef,
        searchValue,
        setQuery,
        showAsk,
        state,
        withAI,
        withSearchAI,
        scopeControl,
    } = useSearchController(searchProps);
    const uiAssistants = assistants.filter((assistant) => assistant.ui === true);

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            open();
        },
        {
            enableOnFormTags: true,
        }
    );

    useHotkeys(
        'mod+i',
        (e) => {
            e.preventDefault();
            assistants[0]?.open();
        },
        {
            enableOnFormTags: true,
        }
    );

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [close]);

    const visible = viewport === 'desktop' ? !isMobile : viewport === 'mobile' ? isMobile : true;
    const searchResultsActiveDescendant = cursor !== null ? `${resultsId}-${cursor}` : undefined;

    return (
        <>
            <Popover
                content={
                    // Only show content if there's a query or Ask is enabled
                    state?.query || withAI ? (
                        <SearchFrame
                            askQuery={askQuery}
                            cursor={cursor}
                            error={error}
                            fetching={fetching}
                            query={query}
                            results={results}
                            resultsId={resultsId}
                            resultsRef={resultsRef}
                            showAsk={showAsk}
                            scopeControl={
                                searchProps.withVariants || searchProps.withSections ? (
                                    <SearchScopeControl {...scopeControl} />
                                ) : null
                            }
                        />
                    ) : null
                }
                rootProps={{
                    open: Boolean(visible && (state?.open ?? false)),
                    modal: false,
                }}
                contentProps={{
                    onOpenAutoFocus: (event) => event.preventDefault(),
                    align: 'start',
                    className:
                        '@container flex flex-col overflow-hidden bg-tint-base has-[.empty]:hidden w-128 p-0 max-h-[min(32rem,var(--radix-popover-content-available-height))] max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                    onInteractOutside: (event) => {
                        // Don't close if clicking on the search input itself
                        if (searchInputRef.current?.contains(event.target as Node)) {
                            event.preventDefault();
                            return;
                        }
                        close();
                    },
                    sideOffset: 8,
                    collisionPadding: {
                        top: 16,
                        right: 16,
                        bottom: 32,
                        left: 16,
                    },
                    hideWhenDetached: true,
                }}
                triggerProps={{
                    asChild: true,
                }}
            >
                <SearchInput
                    ref={searchInputRef}
                    aria-activedescendant={searchResultsActiveDescendant}
                    aria-controls={resultsId}
                    onChange={setQuery}
                    onKeyDown={onInputKeyDown}
                    value={searchValue}
                    withAI={withSearchAI}
                    isOpen={state?.open ?? false}
                    className={className}
                    onFocus={open}
                >
                    <SearchLiveResultsAnnouncer
                        count={results.length}
                        showing={Boolean(searchValue) && !fetching}
                    />
                </SearchInput>
            </Popover>
            {uiAssistants.map((assistant, index) => (
                <AIChatButton
                    key={assistant.id}
                    assistant={assistant}
                    withShortcut={index === 0}
                    showLabel={
                        uiAssistants.length === 1 && style === CustomizationSearchStyle.Prominent
                    }
                />
            ))}
        </>
    );
}
