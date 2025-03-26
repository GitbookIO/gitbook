/**
 * Read the local storage state for the announcement banner and apply the appropriate CSS class to the <html> element.
 *
 * NOTE: this script is stringified and run in the browser, so it must be self-contained and have syntax supported in all browsers.
 */
export function checkStorageForDismissedScript(
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
            const daysSinceDismissal = Math.floor((nowTime - dismissedAt) / (1000 * 60 * 60 * 24));
            if (daysSinceDismissal < daysTillReset) {
                showBanner = false;
            }
        }
    } catch {}

    if (!showBanner) {
        document.documentElement.classList.add(cssClass);
    }
}
