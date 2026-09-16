declare global {
    interface Window {
        Intercom?: (command: string, options?: Record<string, unknown>) => void;
    }
}

// TEMP MOCK: fake window.Intercom + a floating launcher bubble so the hide/show behavior is
// visible locally, where no real Intercom is connected. Not for commit.
if (typeof window !== 'undefined' && typeof window.Intercom !== 'function') {
    const createBubble = () => {
        const el = document.createElement('div');
        el.textContent = '💬';
        Object.assign(el.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#1f2937',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            zIndex: '2147483000',
        });
        document.body.appendChild(el);
        return el;
    };

    // Rendered immediately (not lazily inside window.Intercom) so it's visible on page load,
    // before the chat has ever been opened/closed. This module only runs client-side, where
    // document.body is already present (React hydrates over server-rendered HTML).
    const bubble = createBubble();

    window.Intercom = (command, options) => {
        if (command !== 'update' || !options || !('hide_default_launcher' in options)) {
            return;
        }
        bubble.style.display = options.hide_default_launcher ? 'none' : 'flex';
    };
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
