'use client';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { CustomizationSearchStyle } from '@gitbook/api';
import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AIChatButton } from '../AIChat';
import { useIsMobile } from '../hooks/useIsMobile';
import { Button, Popover } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { SideSheet } from '../primitives/SideSheet';
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
    const language = useLanguage();
    const usesSideSheet = useIsMobile(768);
    const {
        assistants,
        askQuery,
        askCount,
        askInAssistant,
        abort,
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
            if (state?.open && query && askCount > 0) {
                askInAssistant();
                return;
            }
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

    const visible =
        viewport === 'desktop' ? !usesSideSheet : viewport === 'mobile' ? usesSideSheet : true;
    const searchResultsActiveDescendant =
        cursor !== null && cursor < results.length ? `${resultsId}-${cursor}` : undefined;
    const isSearchOpen = Boolean(visible && (state?.open ?? false));
    const shouldFillHeight = Boolean(query || showAsk);
    const shouldShowSearchFrame = usesSideSheet
        ? Boolean(state?.open || state?.query || withAI)
        : Boolean(state?.query || withAI);
    const scopeControlNode =
        searchProps.withVariants || searchProps.withSections ? (
            <SearchScopeControl {...scopeControl} />
        ) : null;

    const frameInput = (
        <SearchInput
            aria-activedescendant={searchResultsActiveDescendant}
            aria-controls={resultsId}
            onChange={setQuery}
            onKeyDown={onInputKeyDown}
            value={searchValue}
            withAI={withSearchAI}
            isOpen={isSearchOpen}
            mode="frame"
            resultsCount={results.length}
            fetching={fetching}
            showAsk={showAsk}
        >
            <SearchLiveResultsAnnouncer
                count={results.length}
                showing={Boolean(searchValue) && !fetching}
            />
        </SearchInput>
    );

    const searchFrame = shouldShowSearchFrame ? (
        <SearchFrame
            askQuery={askQuery}
            cursor={cursor}
            error={error}
            fetching={fetching}
            input={usesSideSheet ? frameInput : undefined}
            query={query}
            results={results}
            resultsId={resultsId}
            resultsRef={resultsRef}
            onResultSelect={abort}
            showAsk={showAsk}
            scopeControl={scopeControlNode}
            fillHeight={usesSideSheet || shouldFillHeight}
        />
    ) : null;

    return (
        <>
            {usesSideSheet ? (
                <Button
                    data-testid="search-button"
                    icon="search"
                    variant="header"
                    size="medium"
                    iconOnly
                    label={
                        <div className="flex items-center gap-2">
                            {t(language, withSearchAI ? 'search_or_ask' : 'search')}
                            <KeyboardShortcut
                                keys={['mod', 'k']}
                                className="border-tint-11 text-tint-1"
                            />
                        </div>
                    }
                    active={isSearchOpen}
                    onClick={open}
                    className={className}
                    aria-expanded={isSearchOpen}
                    aria-controls={resultsId}
                />
            ) : (
                <Popover
                    content={searchFrame}
                    rootProps={{
                        open: isSearchOpen,
                        modal: false,
                    }}
                    contentProps={{
                        onOpenAutoFocus: (event) => event.preventDefault(),
                        align: 'start',
                        className: tcls(
                            '@container flex flex-col overflow-hidden bg-tint-base has-[.empty]:hidden w-128 p-0 max-w-[min(var(--radix-popover-content-available-width),32rem)]',
                            shouldFillHeight
                                ? 'h-[min(32rem,var(--radix-popover-content-available-height))]'
                                : 'max-h-[min(32rem,var(--radix-popover-content-available-height))]'
                        ),
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
                        isOpen={isSearchOpen}
                        className={className}
                        onFocus={open}
                        resultsCount={results.length}
                        fetching={fetching}
                        showAsk={showAsk}
                    >
                        <SearchLiveResultsAnnouncer
                            count={results.length}
                            showing={Boolean(searchValue) && !fetching}
                        />
                    </SearchInput>
                </Popover>
            )}
            {usesSideSheet ? (
                <SideSheet
                    side="right"
                    open={isSearchOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            close();
                        }
                    }}
                    modal
                    withOverlay
                    withCloseButton
                    className="mx-auto w-96 border-tint-subtle border-l bg-tint-base"
                >
                    {searchFrame}
                </SideSheet>
            ) : null}
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
