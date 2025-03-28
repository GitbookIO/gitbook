'use client';

import * as React from 'react';
import {
    ANNOUNCEMENT_CSS_CLASS,
    ANNOUNCEMENT_DAYS_TILL_RESET,
    ANNOUNCEMENT_STORAGE_KEY,
} from './constants';
import { checkStorageForDismissedScript } from './script';

/**
 * Inject a script to read the local storage state for the announcement banner and apply the appropriate CSS class to the <html> element as early as possible.
 * Bypasses react state to prevent flickering.
 */
export function AnnouncementDismissedScript() {
    const scriptArgs = JSON.stringify([
        ANNOUNCEMENT_STORAGE_KEY,
        ANNOUNCEMENT_DAYS_TILL_RESET,
        ANNOUNCEMENT_CSS_CLASS,
    ]).slice(1, -1);

    // makes sure the banner dismissed state is kept when navigating between sites
    React.useEffect(() => {
        checkStorageForDismissedScript(
            ANNOUNCEMENT_STORAGE_KEY,
            ANNOUNCEMENT_DAYS_TILL_RESET,
            ANNOUNCEMENT_CSS_CLASS
        );
    }, []);

    return (
        <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: `(${checkStorageForDismissedScript.toString()})(${scriptArgs})`,
            }}
        />
    );
}
