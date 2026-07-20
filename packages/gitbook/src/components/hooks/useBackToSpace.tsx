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
const FROM_TOC_LINK_KEY = 'gitbook-space-navigation:from-toc-link';

/**
 * Mark that the navigation about to happen was initiated from a link in the table of
 * contents.
 *
 * Only deliberate, author-defined links in the ToC — including cross-space links — may
 * surface a "Back to space" shortcut on the destination page. Reaching another space any
 * other way (an in-content link, the section/variant picker, a direct URL or the browser
 * history) must not. Set synchronously when a ToC link is activated, so the flag is in
 * place before the destination page reads it.
 */
function markSpaceNavigationFromTOCLink() {
    setSessionStorageItem(FROM_TOC_LINK_KEY, true);
}

/**
 * Whether a click opens its link in a new tab or window instead of navigating the
 * current tab (a modifier key or a non-primary button). These must not mark a ToC
 * navigation: the current tab stays put, so the flag would otherwise linger and be
 * mis-attributed to a later, unrelated navigation.
 */
function opensInNewTab(event: React.MouseEvent): boolean {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/**
 * Click handler for the table of contents that marks the upcoming navigation as
 * ToC-initiated, so arriving in a different space can surface the "Back to space"
 * shortcut.
 *
 * Attach it with `onClickCapture` on the root of the page list. It only flags clicks
 * that will actually navigate to a different page, since the destination effect is what
 * consumes the flag: a click that doesn't change the pathname would leave the flag
 * lingering, to be mis-attributed to a later, unrelated navigation. So it does nothing
 * for clicks that open a new tab/window, land on a nested control (e.g. the
 * expand/collapse chevron, which toggles the tree rather than navigating), or target the
 * current page (the active item or an in-page anchor).
 */
export function markSpaceNavigationFromTOCLinkOnClick(event: React.MouseEvent<HTMLElement>) {
    if (opensInNewTab(event)) {
        return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    // The expand/collapse chevron is a <button> nested inside the link; clicking it only
    // toggles the tree (it calls preventDefault/stopPropagation), so it must not flag a
    // navigation — and this runs in the capture phase, before that handler.
    if (target.closest('button')) {
        return;
    }

    const link = target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    // Skip same-page links (the active item, or an in-page anchor): they don't change the
    // pathname, so the effect never re-runs to consume the flag.
    if (link.pathname === window.location.pathname) {
        return;
    }

    markSpaceNavigationFromTOCLink();
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
    fromTocLink: boolean;
}): SpaceLocation | null {
    const { current, lastLocation, storedBack, fromTocLink } = input;

    // No previous navigation this session, or we're still browsing the same space:
    // keep whatever "back" target we already had (it persists while browsing).
    if (!lastLocation || lastLocation.spaceId === current.spaceId) {
        return storedBack && storedBack.spaceId !== current.spaceId ? storedBack : null;
    }

    // The reader moved to a different space since the last navigation.

    // The reader returned to the space they originally came from: clear the shortcut.
    if (storedBack && storedBack.spaceId === current.spaceId) {
        return null;
    }

    // Only a deliberate cross-space link in the table of contents may surface the
    // shortcut — that was the intent of the feature. Reaching a different space any
    // other way (an in-content link, the section/variant picker, a direct URL or the
    // browser history) must not introduce it, and clears any shortcut we were showing.
    if (!fromTocLink) {
        return null;
    }

    // The reader followed a ToC link into a different space: offer to go back to the
    // page they were on.
    return lastLocation;
}

/**
 * Track navigation between spaces and return the space to offer navigating back to.
 *
 * When a reader follows a cross-space link in the ToC into a space different from the
 * one they were browsing, we remember where they came from so a "Back to [space]"
 * shortcut can be surfaced. The shortcut persists while they browse the destination
 * space and is cleared once they return or reach another space some other way.
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

        const fromTocLink = getSessionStorageItem<boolean>(FROM_TOC_LINK_KEY, false);
        removeSessionStorageItem(FROM_TOC_LINK_KEY);

        const back = resolveBackToSpace({
            current: currentLocation,
            lastLocation: getSessionStorageItem<SpaceLocation | null>(LAST_LOCATION_KEY, null),
            storedBack: getSessionStorageItem<SpaceLocation | null>(BACK_TO_SPACE_KEY, null),
            fromTocLink,
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
