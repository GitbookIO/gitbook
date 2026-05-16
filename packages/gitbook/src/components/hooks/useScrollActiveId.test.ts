import { describe, expect, test } from 'bun:test';

import { getActiveSectionId } from './useScrollActiveId';

describe('getActiveSectionId', () => {
    test('prefers the first visible section below the top of the viewport', () => {
        const ids = ['intro', 'setup', 'features'];
        const states = new Map([
            ['intro', { isIntersecting: true, top: -120 }],
            ['setup', { isIntersecting: true, top: 24 }],
            ['features', { isIntersecting: true, top: 380 }],
        ]);

        expect(getActiveSectionId(ids, states)).toBe('setup');
    });

    test('falls back to the last visible section when all visible headings are above the top', () => {
        const ids = ['intro', 'setup', 'features'];
        const states = new Map([
            ['intro', { isIntersecting: true, top: -320 }],
            ['setup', { isIntersecting: true, top: -40 }],
            ['features', { isIntersecting: false, top: 220 }],
        ]);

        expect(getActiveSectionId(ids, states)).toBe('setup');
    });

    test('keeps the last short section active when it is visible near the bottom', () => {
        const ids = ['intro', 'details', 'key-features'];
        const states = new Map([
            ['intro', { isIntersecting: false, top: -640 }],
            ['details', { isIntersecting: true, top: -180 }],
            ['key-features', { isIntersecting: true, top: 410 }],
        ]);

        expect(getActiveSectionId(ids, states)).toBe('key-features');
    });
});
