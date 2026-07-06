'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
    getSessionStorageItem,
    removeSessionStorageItem,
    setSessionStorageItem,
} from '@/lib/browser';

/**
 * A location visited by the reader, scoped to the space it belongs to.
 */
export type SpaceLocation = {
    /** Identifier of the space. */
    spaceId: string;
    /** Localized title of the space, used as the label of the "back" shortcut. */
    spaceTitle: string;
    /** Path (with query string) of the last page visited in the space. */
    url: string;
};

// Keys used to persist the navigation state for the current tab session.
const LAST_LOCATION_KEY = 'gitbook-space-navigation:last';
const BACK_TO_SPACE_KEY = 'gitbook-space-navigation:back';
const FROM_PICKER_KEY = 'gitbook-space-navigation:from-picker';

/**
 * Mark that the navigation about to happen was initiated from the section/variant
 * picker (spaces dropdown, translations dropdown or section switcher).
 *
 * Such navigations are deliberate moves within the site's own structure and should
 * not surface a "Back to space" shortcut. Set synchronously when a picker link is
 * activated, so the flag is in place before the destination page reads it.
 */
function markSpaceNavigationFromPicker() {
    setSessionStorageItem(FROM_PICKER_KEY, true);
}

/**
 * Whether a click opens its link in a new tab or window instead of navigating the
 * current tab (a modifier key or a non-primary button). These must not mark a picker
 * navigation: the current tab stays put, so the flag would otherwise linger and be
 * mis-attributed to a later, unrelated navigation.
 */
function opensInNewTab(event: React.MouseEvent): boolean {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/**
 * Click handler for the section/variant/translation pickers that marks the upcoming
 * navigation as picker-initiated, so arriving in the target space doesn't surface a
 * "Back to space" shortcut.
 *
 * Attach it with `onClickCapture` on a picker container (section list/tabs) or as the
 * `onClick` of a picker menu item (spaces dropdown). It intentionally does nothing for
 * clicks that leave the current tab unchanged: re-selecting the already-active item,
 * or opening the link in a new tab/window.
 */
export function markSpaceNavigationFromPickerOnClick(event: React.MouseEvent<HTMLElement>) {
    if (opensInNewTab(event)) {
        return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const link = target.closest('a[href]');
    if (!link) {
        return;
    }

    // Skip the currently active item: re-selecting it doesn't navigate. The sidebar
    // section list marks the active link with `aria-current`, while the header section
    // tabs (rendered via the Button primitive) use `aria-pressed`.
    if (
        link.getAttribute('aria-current') === 'page' ||
        link.getAttribute('aria-pressed') === 'true'
    ) {
        return;
    }

    markSpaceNavigationFromPicker();
}

/**
 * Determine which space (if any) the reader should be offered to navigate back to,
 * given the current location and the state persisted from the previous navigation.
 *
 * This is the pure decision logic behind {@link useBackToSpace}, extracted so it can
 * be unit-tested without a DOM.
 */
export function resolveBackToSpace(input: {
    current: SpaceLocation;
    lastLocation: SpaceLocation | null;
    storedBack: SpaceLocation | null;
    fromPicker: boolean;
}): SpaceLocation | null {
    const { current, lastLocation, storedBack, fromPicker } = input;

    // No previous navigation this session, or we're still browsing the same space:
    // keep whatever "back" target we already had (it persists while browsing).
    if (!lastLocation || lastLocation.spaceId === current.spaceId) {
        return storedBack && storedBack.spaceId !== current.spaceId ? storedBack : null;
    }

    // The reader moved to a different space since the last navigation.

    // Switching space through the picker is a deliberate navigation within the
    // site structure: reset the context instead of offering to go back.
    if (fromPicker) {
        return null;
    }

    // The reader returned to the space they originally came from.
    if (storedBack && storedBack.spaceId === current.spaceId) {
        return null;
    }

    // The reader followed a link into a different space: offer to go back to the
    // page they were on.
    return lastLocation;
}

/**
 * Track navigation between spaces and return the space to offer navigating back to.
 *
 * When a reader follows a link (in the ToC or in the content) into a space different
 * from the one they were browsing, we remember where they came from so a "Back to
 * [space]" shortcut can be surfaced. The shortcut persists while they browse the
 * destination space and is cleared once they return or switch space through the
 * section/variant picker.
 *
 * The state is kept in `sessionStorage` so it survives both client-side and full-page
 * navigations within the tab, without leaking across tabs or sessions.
 */
export function useBackToSpace(current: {
    spaceId: string;
    spaceTitle: string;
}): SpaceLocation | null {
    const { spaceId, spaceTitle } = current;
    const pathname = usePathname();
    const [backToSpace, setBackToSpace] = React.useState<SpaceLocation | null>(null);

    React.useEffect(() => {
        const currentLocation: SpaceLocation = {
            spaceId,
            spaceTitle,
            // `pathname` (from Next) is the app-relative path used for client navigation,
            // paired with the current query string so we return to the exact same page.
            url: `${pathname}${window.location.search}`,
        };

        const fromPicker = getSessionStorageItem<boolean>(FROM_PICKER_KEY, false);
        removeSessionStorageItem(FROM_PICKER_KEY);

        const back = resolveBackToSpace({
            current: currentLocation,
            lastLocation: getSessionStorageItem<SpaceLocation | null>(LAST_LOCATION_KEY, null),
            storedBack: getSessionStorageItem<SpaceLocation | null>(BACK_TO_SPACE_KEY, null),
            fromPicker,
        });

        if (back) {
            setSessionStorageItem(BACK_TO_SPACE_KEY, back);
        } else {
            removeSessionStorageItem(BACK_TO_SPACE_KEY);
        }
        setSessionStorageItem(LAST_LOCATION_KEY, currentLocation);

        setBackToSpace(back);
    }, [pathname, spaceId, spaceTitle]);

    return backToSpace;
}
