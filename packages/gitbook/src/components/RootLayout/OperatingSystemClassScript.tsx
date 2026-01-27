'use client';

import * as React from 'react';

// This function has to be pure because we do a `.toString()` on it.
function setOperatingSystemClass() {
    if (typeof navigator === 'undefined') return;

    const OS_MAC_CLASS = 'os-mac';
    const platform = navigator.platform.toLowerCase();
    const isMac = platform.includes('mac');
    const root = document.documentElement;

    if (isMac) {
        root.classList.add(OS_MAC_CLASS);
    } else {
        root.classList.remove(OS_MAC_CLASS);
    }
}

/**
 * Inject a script to detect the OS and apply a class to the <html> element as early as possible.
 * Bypasses react state to prevent flickering.
 */
export function OperatingSystemClassScript() {
    React.useEffect(() => {
        setOperatingSystemClass();
    }, []);

    return (
        <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: `(${setOperatingSystemClass.toString()})()`,
            }}
        />
    );
}
