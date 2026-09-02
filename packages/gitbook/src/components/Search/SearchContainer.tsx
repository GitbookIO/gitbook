'use client';

import dynamic from 'next/dynamic';
import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { CustomizationSearchStyle } from '@gitbook/api';

import { AIChatButton } from '../AIChat';
import { useIsMobile } from '../hooks/useIsMobile';
import { Button, Popover } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { SideSheet } from '../primitives/SideSheet';
import type { SearchBaseProps } from './search-props';
import { SearchInput } from './SearchInput';
import { SearchLiveResultsAnnouncer } from './SearchLiveResultsAnnouncer';
import { SearchScopeControl } from './SearchScopeControl';
import { useSearchController } from './useSearchController';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

const SEARCH_POPUP_FOCUSABLE_SELECTOR = [
    'a[href]:not([aria-disabled="true"])',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const SearchFrame = dynamic(() => import('./SearchFrame').then((mod) => mod.SearchFrame), {
    ssr: false,
});

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
    const [searchPopup, setSearchPopup] = React.useState<HTMLDivElement | null>(null);
    const language = useLanguage();
    const usesSideSheet = useIsMobile(768);
    const {
        assistants,
        askQuery,
        askCount,
        askInAssistant,
        close,
        cursor,
        error,
        fetching,
        onInputKeyDown,
        onResultSelect,
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
            // Match the produced key, not the physical key position, so non-QWERTY
            // layouts don't trigger the shortcut by position. RND-11340.
            useKey: true,
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
            // Match the produced key so Dvorak ⌘-C (physical "I" key) copies
            // instead of opening the Assistant. RND-11340.
            useKey: true,
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

    // The SideSheet always renders its children (it hides them with CSS, unlike the desktop
    // Popover which mounts its content on open). Mounting the frame only after the first open
    // keeps the dynamic SearchFrame chunk off the mobile startup path, while leaving it mounted
    // afterwards so the sheet's exit animation isn't cut short.
    const [wasSearchOpened, setWasSearchOpened] = React.useState(false);
    React.useEffect(() => {
        if (isSearchOpen) {
            setWasSearchOpened(true);
        }
    }, [isSearchOpen]);

    const shouldShowSearchFrame = usesSideSheet
        ? Boolean(state?.open || state?.query || wasSearchOpened)
        : Boolean(state?.query || withAI);

    React.useEffect(() => {
        if (
            usesSideSheet ||
            !isSearchOpen ||
            !shouldShowSearchFrame ||
            !searchInputRef.current ||
            !searchPopup
        ) {
            return;
        }

        const searchInput = searchInputRef.current.querySelector<HTMLElement>(
            '[data-testid="search-input"]'
        );
        if (!searchInput) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') {
                return;
            }

            const popupControls = Array.from(
                searchPopup.querySelectorAll<HTMLElement>(SEARCH_POPUP_FOCUSABLE_SELECTOR)
            ).filter((element) => element.getClientRects().length > 0);
            const focusableElements = [searchInput, ...popupControls];
            const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
            const nextIndex =
                currentIndex === -1
                    ? event.shiftKey
                        ? focusableElements.length - 1
                        : 0
                    : event.shiftKey
                      ? currentIndex - 1
                      : currentIndex + 1;
            const wrappedIndex = (nextIndex + focusableElements.length) % focusableElements.length;

            event.preventDefault();
            focusableElements[wrappedIndex]?.focus();
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isSearchOpen, searchPopup, shouldShowSearchFrame, usesSideSheet]);

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
            onResultSelect={onResultSelect}
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
                <>
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
                    {/* Anchored, not triggered: a trigger gives the input button semantics and
                        swallows the space bar. */}
                    <Popover
                        content={searchFrame}
                        anchor={searchInputRef}
                        popupRef={setSearchPopup}
                        popupTestId="search-popover"
                        rootProps={{
                            open: isSearchOpen,
                            onOpenChange: (nextOpen, eventDetails) => {
                                if (nextOpen) {
                                    open();
                                    return;
                                }
                                // Without a trigger, the input counts as outside the popover.
                                if (
                                    eventDetails.reason === 'outside-press' &&
                                    searchInputRef.current?.contains(
                                        eventDetails.event.target as Node
                                    )
                                ) {
                                    eventDetails.cancel();
                                    return;
                                }
                                close();
                            },
                        }}
                        positionerProps={{
                            align: 'start',
                            sideOffset: 8,
                            collisionPadding: {
                                top: 16,
                                right: 16,
                                bottom: 32,
                                left: 16,
                            },
                        }}
                        popupProps={{
                            initialFocus: false,
                            // Restoring focus to the input would re-fire `onFocus` and reopen it.
                            finalFocus: false,
                            className: tcls(
                                '@container flex flex-col overflow-hidden bg-tint-base has-[.empty]:hidden w-128 p-0 max-w-[min(var(--available-width),32rem)]',
                                shouldFillHeight
                                    ? 'h-[min(32rem,var(--available-height))]'
                                    : 'max-h-[min(32rem,var(--available-height))]'
                            ),
                        }}
                    />
                </>
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
                    className="mx-auto w-96 border-l border-tint-subtle bg-tint-base"
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
