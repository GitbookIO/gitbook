'use client';

import React from 'react';
import { ANNOUNCEMENT_STORAGE_KEY } from './constants';
import * as storage from '@/lib/local-storage';

interface AnnouncementStoreState {
    visible: boolean;
    at: number;
}

/**
 * Hook to manage the announcement state.
 *
 * Returns if the announcement should be visible and a function to dismiss it.
 */
export function useAnnouncementState() {
    const [state, setState] = React.useState<AnnouncementStoreState>(
        getAnnouncementFromLocalStorage()
    );

    const dismiss = React.useCallback(() => {
        const dismissed = { visible: false, at: Date.now() };
        storage.setItem(ANNOUNCEMENT_STORAGE_KEY, dismissed);
        // using simple state update here instead of something like useSyncExternalStore to avoid unnecessary complexity
        setState(dismissed);
    }, []);

    return { visible: isVisibleFromState(state), dismiss };
}

function getAnnouncementFromLocalStorage(): AnnouncementStoreState {
    const defaultState = { visible: true, at: Date.now() };
    try {
        return storage.getItem(ANNOUNCEMENT_STORAGE_KEY, defaultState);
    } catch {}

    return defaultState;
}

// TODO: duplicatge code with injected script
export function isVisibleFromState(announcementState?: AnnouncementStoreState) {
    if (announcementState && !announcementState?.visible) {
        // it should be browser safe
        const { at: dismissedAt } = announcementState;
        const nowTime = new Date().getTime();

        // Check if enough days have passed since dismissal
        const daysSinceDismissal = Math.floor((nowTime - dismissedAt) / (1000 * 60 * 60 * 24));
        if (daysSinceDismissal < 7) {
            return false;
        }
    }

    return true;
}
