declare global {
    interface Window {
        Intercom?: (command: string, options?: Record<string, unknown>) => void;
    }
}

/**
 * Hide or show Intercom's default launcher when it is available on the host page.
 */
export function setIntercomLauncherHidden(hidden: boolean): void {
    if (typeof window === 'undefined' || typeof window.Intercom !== 'function') {
        return;
    }

    window.Intercom('update', { hide_default_launcher: hidden });
}
