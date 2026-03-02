import React from 'react';

import {
    getLocalStorageItem,
    getSessionStorageItem,
    removeSessionStorageItem,
    setLocalStorageItem,
    setSessionStorageItem,
} from '@/lib/browser/local-storage';

const STORAGE_KEY = 'gitbook_toolbar_closed';
const SESSION_STORAGE_KEY = 'gitbook_toolbar_session_closed';
const SESSION_MINIFIED_KEY = 'gitbook_toolbar_minified';
const VISIBILITY_HINT_DISMISSED_KEY = 'gitbook_toolbar_hint_dismissed';

type SessionHideReason = 'session' | 'persistent';

/**
 * Read the current session hide state. We store whether the toolbar was hidden “for session” or
 * “persistently” so we can distinguish between a temporary dismissal and a user preference.
 */
export const getSessionHideState = (): { hidden: boolean; reason?: SessionHideReason } => {
    const value = getSessionStorageItem<SessionHideReason | null>(SESSION_STORAGE_KEY, null);
    if (value === 'session' || value === 'persistent') {
        return { hidden: true, reason: value };
    }
    return { hidden: false, reason: undefined };
};

/**
 * Persist the session hide state. Passing `false` clears the stored preference entirely.
 */
export const setSessionHidden = (value: boolean, reason?: SessionHideReason) => {
    if (value && reason) {
        setSessionStorageItem(SESSION_STORAGE_KEY, reason);
    } else {
        removeSessionStorageItem(SESSION_STORAGE_KEY);
    }
};

/**
 * Retrieve the last minified state from session storage. If no value was ever stored we return
 * `undefined`, which signals that the toolbar should auto-expand once the logo animation finishes.
 */
export const getStoredMinified = (): boolean | undefined => {
    const stored = getSessionStorageItem<boolean | null>(SESSION_MINIFIED_KEY, null);
    if (stored === null || stored === undefined) {
        removeSessionStorageItem(SESSION_MINIFIED_KEY);
        return undefined;
    }
    return stored;
};

/**
 * Persist the current minified state for the ongoing session.
 */
export const setStoredMinified = (value: boolean) => {
    setSessionStorageItem(SESSION_MINIFIED_KEY, value);
};

/**
 * Check whether the user has dismissed the "only you can see this" hint.
 */
export const getVisibilityHintDismissed = (): boolean => {
    return getSessionStorageItem(VISIBILITY_HINT_DISMISSED_KEY, false);
};

/**
 * Persist that the user dismissed the visibility hint for the current session.
 */
export const setVisibilityHintDismissed = () => {
    setSessionStorageItem(VISIBILITY_HINT_DISMISSED_KEY, true);
};

interface UseToolbarVisibilityOptions {
    onPersistentClose?: () => void;
    onSessionClose?: () => void;
    onToggleMinify?: () => void;
}

export function useToolbarVisibility(options: UseToolbarVisibilityOptions = {}) {
    const { onPersistentClose, onSessionClose, onToggleMinify } = options;

    const [initialStoredMinified] = React.useState<boolean | undefined>(() =>
        typeof window !== 'undefined' ? getStoredMinified() : undefined
    );
    const shouldAutoExpand = initialStoredMinified === undefined;

    const [minified, setMinifiedState] = React.useState<boolean>(() =>
        initialStoredMinified !== undefined ? initialStoredMinified : true
    );

    const [persistentHidden, setPersistentHidden] = React.useState(() =>
        getLocalStorageItem(STORAGE_KEY, false)
    );

    const [sessionReason, setSessionReason] = React.useState<SessionHideReason | undefined>(() => {
        const state = getSessionHideState();
        return state.hidden ? state.reason : undefined;
    });

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorage = () => {
            setPersistentHidden(getLocalStorageItem(STORAGE_KEY, false));
            const state = getSessionHideState();
            setSessionReason(state.hidden ? state.reason : undefined);
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    React.useEffect(() => {
        if (persistentHidden) {
            if (sessionReason !== 'persistent') {
                // Sync the session flag so we honour the persistent preference and avoid flashes when
                // opening new tabs in the same browsing session.
                setSessionHidden(true, 'persistent');
                setSessionReason('persistent');
            }
            return;
        }

        if (sessionReason === 'persistent') {
            // If the persistent preference was cleared we also clear the session flag so the toolbar
            // can reappear immediately without requiring a full reload.
            setSessionHidden(false);
            setSessionReason(undefined);
        }
    }, [persistentHidden, sessionReason]);

    const setMinified = (value: boolean) => {
        setMinifiedState(value);
        setStoredMinified(value);
        onToggleMinify?.();
    };

    const minimize = () => setMinified(true);

    const closeSession = () => {
        setSessionHidden(true, 'session');
        setSessionReason('session');
        onSessionClose?.();
    };

    const closePersistent = () => {
        setLocalStorageItem(STORAGE_KEY, true);
        setPersistentHidden(true);
        setSessionHidden(true, 'persistent');
        setSessionReason('persistent');
        onPersistentClose?.();
    };

    const hidden = persistentHidden || sessionReason === 'session';

    return {
        minified,
        setMinified,
        shouldAutoExpand,
        hidden,
        minimize,
        closeSession,
        closePersistent,
    };
}
