import { describe, expect, it } from 'bun:test';

import { type SpaceLocation, resolveBackToSpace } from './useBackToSpace';

const gettingStarted: SpaceLocation = {
    spaceId: 'space_gs',
    spaceTitle: 'Getting Started',
    url: '/docs/getting-started',
};
const programmersGuide: SpaceLocation = {
    spaceId: 'space_pg',
    spaceTitle: "Programmer's Guide",
    url: '/docs/programmers-guide',
};
const apiReference: SpaceLocation = {
    spaceId: 'space_api',
    spaceTitle: 'API Reference',
    url: '/docs/api',
};

describe('resolveBackToSpace', () => {
    it('offers nothing on the first navigation of a session', () => {
        expect(
            resolveBackToSpace({
                current: gettingStarted,
                lastLocation: null,
                storedBack: null,
                fromPicker: false,
            })
        ).toBeNull();
    });

    it('offers to go back after following a link into a different space', () => {
        expect(
            resolveBackToSpace({
                current: programmersGuide,
                lastLocation: gettingStarted,
                storedBack: null,
                fromPicker: false,
            })
        ).toEqual(gettingStarted);
    });

    it('keeps the back target while browsing within the destination space', () => {
        const deeperInGuide: SpaceLocation = {
            ...programmersGuide,
            url: '/docs/programmers-guide/chapter-2',
        };
        expect(
            resolveBackToSpace({
                current: deeperInGuide,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromPicker: false,
            })
        ).toEqual(gettingStarted);
    });

    it('does not offer to go back when the space was changed through the picker', () => {
        expect(
            resolveBackToSpace({
                current: programmersGuide,
                lastLocation: gettingStarted,
                storedBack: null,
                fromPicker: true,
            })
        ).toBeNull();
    });

    it('clears the back target once the reader returns to the space they came from', () => {
        expect(
            resolveBackToSpace({
                current: gettingStarted,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromPicker: false,
            })
        ).toBeNull();
    });

    it('points back to the most recent space when chaining cross-space links', () => {
        // Was in Getting Started (stored back), followed a link from the Programmer's
        // Guide into the API Reference: back should now point to the Programmer's Guide.
        expect(
            resolveBackToSpace({
                current: apiReference,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromPicker: false,
            })
        ).toEqual(programmersGuide);
    });

    it('resets the back target when switching space through the picker even if one was set', () => {
        expect(
            resolveBackToSpace({
                current: apiReference,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromPicker: true,
            })
        ).toBeNull();
    });
});
