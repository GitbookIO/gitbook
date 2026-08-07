'use client';

import { useCallback } from 'react';
import * as zustand from 'zustand';

type TOCGroupState = {
    isOpen: boolean;
    /** Whether the visitor toggled the group themselves, as opposed to it following the active page. */
    userToggled: boolean;
};

// The table of contents lives in the site layout, whose client subtree is remounted on
// client-side navigation (see useClearRouterCache and https://github.com/vercel/next.js/issues/67542).
// Keeping each group's open/closed state in component-local `useState`/`useRef` therefore resets it on
// every navigation, making the sidebar expand/collapse or lose its expanded context as visitors move
// between pages. We keep the state in a module-level store so it survives those remounts.
const useStore = zustand.create<{
    groups: Record<string, TOCGroupState>;
    setOpen: (id: string, isOpen: boolean) => void;
}>((set) => ({
    groups: {},
    setOpen: (id, isOpen) =>
        set((state) => ({
            groups: { ...state.groups, [id]: { isOpen, userToggled: true } },
        })),
}));

/**
 * Persisted open/collapsed state for a collapsible table-of-contents group.
 *
 * Until the visitor toggles the group, it follows `defaultOpen` (e.g. the group containing the
 * active page). Once toggled, their choice is remembered across navigations for the session, so
 * navigating between pages no longer resets the sidebar.
 */
export function useTOCGroupState(
    id: string,
    defaultOpen: boolean
): [boolean, (isOpen: boolean) => void] {
    const stored = useStore((state) => state.groups[id]);
    const setOpen = useStore((state) => state.setOpen);

    const isOpen = stored?.userToggled ? stored.isOpen : defaultOpen;

    const setIsOpen = useCallback((next: boolean) => setOpen(id, next), [id, setOpen]);

    return [isOpen, setIsOpen];
}
