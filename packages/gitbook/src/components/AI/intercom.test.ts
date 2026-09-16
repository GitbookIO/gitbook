import { afterEach, describe, expect, it } from 'bun:test';

import { setIntercomLauncherPadding } from './intercom';

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

describe('setIntercomLauncherPadding', () => {
    it('sets the Intercom launcher horizontal padding', () => {
        const calls: unknown[][] = [];
        installIntercom((...args) => calls.push(args));

        setIntercomLauncherPadding(384);

        expect(calls).toEqual([['update', { horizontal_padding: 384 }]]);
    });

    it('does nothing when Intercom is unavailable', () => {
        expect(() => setIntercomLauncherPadding(384)).not.toThrow();
    });
});
