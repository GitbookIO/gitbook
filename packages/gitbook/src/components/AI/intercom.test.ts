import { afterEach, describe, expect, it } from 'bun:test';

import { setIntercomLauncherHidden } from './intercom';

const originalWindow = globalThis.window;

afterEach(() => {
    if (originalWindow === undefined) {
        delete (globalThis as { window?: Window }).window;
    } else {
        globalThis.window = originalWindow;
    }
});

function installIntercom(intercom: Window['Intercom']): void {
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: { Intercom: intercom },
        writable: true,
    });
}

describe('setIntercomLauncherHidden', () => {
    it('hides the Intercom launcher', () => {
        const calls: unknown[][] = [];
        installIntercom((...args) => calls.push(args));

        setIntercomLauncherHidden(true);

        expect(calls).toEqual([['update', { hide_default_launcher: true }]]);
    });

    it('shows the Intercom launcher', () => {
        const calls: unknown[][] = [];
        installIntercom((...args) => calls.push(args));

        setIntercomLauncherHidden(false);

        expect(calls).toEqual([['update', { hide_default_launcher: false }]]);
    });

    it('does nothing when Intercom is unavailable', () => {
        expect(() => setIntercomLauncherHidden(true)).not.toThrow();
    });
});
