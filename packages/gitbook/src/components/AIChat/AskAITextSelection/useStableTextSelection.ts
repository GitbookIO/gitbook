'use client';

import * as React from 'react';

type SelectionAnchor = {
    top: number;
    bottom: number;
    centerX: number;
};

export type StableTextSelection = {
    anchor: SelectionAnchor;
    text: string;
};

type Options = {
    /** Selector of the content root; both selection endpoints must be inside it. */
    rootSelector: string;
    enabled: boolean;
    /** Pointer events inside this element are ignored, so clicking the UI keeps the selection. */
    ignoreRef: React.RefObject<HTMLElement | null>;
};

const KEYBOARD_DEBOUNCE_MS = 250;
const SCROLL_SETTLE_MS = 200;
// Coalesces the rapid down/up bursts of a double/triple-click into a single, non-flashing show.
const POINTER_SETTLE_MS = 120;

/**
 * Track a stable text selection within `rootSelector`, debounced so the floating UI it powers
 * doesn't flicker mid-gesture. The selection is dropped on collapse, window blur, scroll, and
 * when a new gesture starts.
 */
export function useStableTextSelection(options: Options): {
    selection: StableTextSelection | null;
    clear: () => void;
} {
    const { rootSelector, enabled, ignoreRef } = options;
    const [selection, setSelection] = React.useState<StableTextSelection | null>(null);

    const clear = React.useCallback(() => {
        window.getSelection()?.removeAllRanges();
        setSelection(null);
    }, []);

    React.useEffect(() => {
        if (!enabled) {
            setSelection(null);
            return;
        }

        let pointerDown = false;
        let keyboardTimer: ReturnType<typeof setTimeout> | null = null;
        let scrollTimer: ReturnType<typeof setTimeout> | null = null;
        let finalizeTimer: ReturnType<typeof setTimeout> | null = null;

        const clearKeyboardTimer = () => {
            if (keyboardTimer) {
                clearTimeout(keyboardTimer);
                keyboardTimer = null;
            }
        };

        const clearFinalizeTimer = () => {
            if (finalizeTimer) {
                clearTimeout(finalizeTimer);
                finalizeTimer = null;
            }
        };

        const finalize = () => {
            // A new gesture started; it will reschedule its own finalize.
            if (pointerDown) {
                return;
            }
            setSelection(readStableSelection(rootSelector));
        };

        const schedulePointerFinalize = () => {
            clearKeyboardTimer();
            clearFinalizeTimer();
            finalizeTimer = setTimeout(() => {
                finalizeTimer = null;
                finalize();
            }, POINTER_SETTLE_MS);
        };

        const isIgnored = (target: EventTarget | null) =>
            target instanceof Node && !!ignoreRef.current?.contains(target);

        const onSelectionChange = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !sel.toString().trim()) {
                clearKeyboardTimer();
                setSelection(null);
                return;
            }
            // Mid-drag, or a pointer finalize is already queued: let the gesture settle first.
            if (pointerDown || finalizeTimer) {
                return;
            }
            clearKeyboardTimer();
            keyboardTimer = setTimeout(finalize, KEYBOARD_DEBOUNCE_MS);
        };

        const onPointerDown = (event: PointerEvent) => {
            if (isIgnored(event.target)) {
                return;
            }
            // New gesture: hide and cancel a pending show so it can't fire mid double-click.
            pointerDown = true;
            clearFinalizeTimer();
            setSelection(null);
        };

        const onPointerUp = (event: PointerEvent) => {
            if (isIgnored(event.target)) {
                return;
            }
            pointerDown = false;
            schedulePointerFinalize();
        };

        // pointercancel replaces pointerup when a gesture is interrupted (OS gesture, scroll handoff).
        const onPointerCancel = () => {
            pointerDown = false;
            schedulePointerFinalize();
        };

        const onScroll = () => {
            setSelection(null);
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(() => {
                if (!pointerDown) {
                    finalize();
                }
            }, SCROLL_SETTLE_MS);
        };

        const onWindowBlur = () => {
            clearKeyboardTimer();
            setSelection(null);
        };

        document.addEventListener('selectionchange', onSelectionChange);
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('pointerup', onPointerUp, true);
        document.addEventListener('pointercancel', onPointerCancel, true);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('blur', onWindowBlur);

        return () => {
            document.removeEventListener('selectionchange', onSelectionChange);
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('pointerup', onPointerUp, true);
            document.removeEventListener('pointercancel', onPointerCancel, true);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('blur', onWindowBlur);
            clearKeyboardTimer();
            clearFinalizeTimer();
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
        };
    }, [enabled, rootSelector, ignoreRef]);

    return { selection, clear };
}

function readStableSelection(rootSelector: string): StableTextSelection | null {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        return null;
    }

    const text = sel.toString().trim();
    if (!text) {
        return null;
    }

    const root = document.querySelector(rootSelector);
    if (!root || !root.contains(sel.anchorNode) || !root.contains(sel.focusNode)) {
        return null;
    }

    const anchor = getSelectionAnchor(sel);
    return anchor ? { anchor, text } : null;
}

/** Box centered above the whole selection, or null if it has no size or is scrolled out of view. */
function getSelectionAnchor(sel: Selection): SelectionAnchor | null {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) {
        return null;
    }
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return null;
    }
    return { top: rect.top, bottom: rect.bottom, centerX: rect.left + rect.width / 2 };
}
