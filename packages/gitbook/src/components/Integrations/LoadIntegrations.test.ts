import { describe, expect, it } from 'bun:test';

import { filterScriptsByConsent } from './scripts';

describe('filterScriptsByConsent', () => {
    const scripts = [
        { script: 'https://example.com/no-consent.js', cookies: false },
        { script: 'https://example.com/consent-required.js', cookies: true },
        { script: 'https://example.com/default.js' },
    ];

    it('loads only non-cookie scripts without explicit consent', () => {
        expect(filterScriptsByConsent(scripts, false)).toEqual([
            { script: 'https://example.com/no-consent.js', cookies: false },
            { script: 'https://example.com/default.js' },
        ]);
    });

    it('loads cookie-dependent scripts after explicit consent', () => {
        expect(filterScriptsByConsent(scripts, true)).toEqual(scripts);
    });
});
