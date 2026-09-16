declare global {
    interface Window {
        Intercom?: (command: string, options?: Record<string, unknown>) => void;
    }
}

/**
 * Shift Intercom's default launcher when it is available on the host page.
 */
export function setIntercomLauncherPadding(paddingPx: number): void {
    if (typeof window === 'undefined' || typeof window.Intercom !== 'function') {
        return;
    }

    window.Intercom('update', { horizontal_padding: paddingPx });
}
