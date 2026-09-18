import React from 'react';

const SEARCH_POPUP_FOCUSABLE_SELECTOR = [
    'a[href]:not([aria-disabled="true"])',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps Tab/Shift+Tab within the search input and its popup while it's open, and hands focus
 * off to the adjacent page element once the trap's boundary is reached.
 */
export function useSearchPopupFocusTrap({
    close,
    searchInputRef,
    searchPopup,
    usesSideSheet,
}: {
    close: () => void;
    searchInputRef: React.RefObject<HTMLDivElement | null>;
    searchPopup: HTMLDivElement | null;
    usesSideSheet: boolean;
}) {
    React.useEffect(() => {
        if (usesSideSheet || !searchInputRef.current || !searchPopup) {
            return;
        }

        const searchInput = searchInputRef.current.querySelector<HTMLElement>(
            '[data-testid="search-input"]'
        );
        if (!searchInput) {
            return;
        }

        // Finds the next (or previous) focusable element in real document order,
        // skipping the popup's own content as well as Base UI's internal focus-guard
        // sentinels — both live in a portal, so their DOM position doesn't match their
        // visual position after the search input, and would otherwise re-trap focus.
        const findAdjacentPageElement = (direction: 'next' | 'previous') => {
            const step = direction === 'next' ? 1 : -1;
            const pageFocusable = Array.from(
                document.querySelectorAll<HTMLElement>(SEARCH_POPUP_FOCUSABLE_SELECTOR)
            ).filter(
                (element) =>
                    element.getClientRects().length > 0 &&
                    !element.closest('[data-base-ui-portal], [data-base-ui-focus-guard]')
            );
            return pageFocusable[pageFocusable.indexOf(searchInput) + step];
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') {
                return;
            }

            const activeElement = document.activeElement as HTMLElement | null;
            // Whether or not the popover ever visibly opened, Base UI still keeps a pair
            // of hidden, tabbable focus-guard nodes mounted in its portal — reachable by
            // Tab regardless of open state, and otherwise a dead end.
            const isOnOwnFocusGuard = Boolean(
                activeElement?.hasAttribute('data-base-ui-focus-guard') &&
                searchPopup.closest('[data-base-ui-portal]')?.contains(activeElement)
            );

            const popupControls = Array.from(
                searchPopup.querySelectorAll<HTMLElement>(SEARCH_POPUP_FOCUSABLE_SELECTOR)
            ).filter((element) => element.getClientRects().length > 0);
            const focusableElements = [searchInput, ...popupControls];
            const currentIndex = focusableElements.indexOf(activeElement as HTMLElement);

            if (currentIndex === -1 && !isOnOwnFocusGuard) {
                // Focus isn't within the search widget — leave native Tab handling alone.
                return;
            }

            if (event.shiftKey && currentIndex === 0) {
                // Search input is a regular DOM node, so the browser's native Shift+Tab
                // already moves focus to whatever precedes it once we close the popover.
                close();
                return;
            }

            if (event.shiftKey && (isOnOwnFocusGuard || currentIndex === -1)) {
                event.preventDefault();
                close();
                findAdjacentPageElement('previous')?.focus();
                return;
            }

            if (
                !event.shiftKey &&
                (isOnOwnFocusGuard || currentIndex === focusableElements.length - 1)
            ) {
                event.preventDefault();
                close();
                findAdjacentPageElement('next')?.focus();
                return;
            }

            const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
            event.preventDefault();
            focusableElements[nextIndex]?.focus();
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [close, searchPopup, usesSideSheet]);
}
