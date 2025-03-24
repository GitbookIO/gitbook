'use client';
// import * as storage from '@/lib/local-storage';

export const ANNOUNCEMENT_STORAGE_KEY = 'announcement_expiration';
export const ANNOUNCEMENT_CSS_CLASS = 'announcement-hidden';
export const ANNOUNCEMENT_DAYS_TILL_RESET = 7;

export function AnnouncementScript() {
    return (
        <script
            id="announcement-script"
            suppressHydrationWarning
            // nonce={typeof window === 'undefined' ? nonce : ''}
            dangerouslySetInnerHTML={{
                __html: `(${readLocalStorageScript.toString()})()`,
            }}
        />
    );
}

export function readLocalStorageScript() {
    let showBanner = true;

    try {
        const announcementStateStr = window.localStorage.getItem('@gitbook/announcement');
        const announcementState = announcementStateStr
            ? JSON.parse(announcementStateStr)
            : {
                  visible: true,
                  at: Date.now(),
              };

        if (announcementState && !announcementState.visible) {
            // it should be browser safe
            const { at: dismissedAt } = announcementState;
            const nowTime = new Date().getTime();

            // Check if enough days have passed since dismissal
            const daysSinceDismissal = Math.floor((nowTime - dismissedAt) / (1000 * 60 * 60 * 24));
            if (daysSinceDismissal < 7) {
                showBanner = false;
            }
        }
    } catch (err) {
        console.error(err);
    }

    // html
    if (!showBanner) {
        document.documentElement.classList.add('announcement-hidden');
    } else {
        document.documentElement.classList.remove('announcement-hidden');
    }
}
