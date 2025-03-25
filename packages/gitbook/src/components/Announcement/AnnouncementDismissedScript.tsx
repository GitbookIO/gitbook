'use client';

import {
    ANNOUNCEMENT_CSS_CLASS,
    ANNOUNCEMENT_DAYS_TILL_RESET,
    ANNOUNCEMENT_STORAGE_KEY,
} from './constants';

/**
 * Inject a script to read the local storage state for the announcement banner and apply the appropriate CSS class to the <html> element as early as possible.
 * Bypasses react state to prevent flickering.
 */
export function AnnouncementDismissedScript() {
    /**
     * Read the local storage state for the announcement banner and apply the appropriate CSS class to the <html> element.
     */
    function checkStorageForDismissedScript(
        storageKey: string,
        daysTillReset: number,
        cssClass: string
    ) {
        let showBanner = true;

        try {
            const announcementStateStr = window.localStorage.getItem(storageKey);
            const announcementState = announcementStateStr
                ? JSON.parse(announcementStateStr)
                : undefined;

            if (announcementState && !announcementState.visible) {
                const dismissedAt = announcementState.at;
                const nowTime = new Date().getTime();

                // Check if enough days have passed since dismissal
                const daysSinceDismissal = Math.floor(
                    (nowTime - dismissedAt) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceDismissal < daysTillReset) {
                    showBanner = false;
                }
            }
        } catch {}

        if (!showBanner) {
            document.documentElement.classList.add(cssClass);
        }
    }

    const scriptArgs = JSON.stringify([
        ANNOUNCEMENT_STORAGE_KEY,
        ANNOUNCEMENT_DAYS_TILL_RESET,
        ANNOUNCEMENT_CSS_CLASS,
    ]).slice(1, -1);

    return (
        <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: `(${checkStorageForDismissedScript.toString()})(${scriptArgs})`,
            }}
        />
    );
}
