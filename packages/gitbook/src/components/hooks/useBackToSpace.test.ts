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
                fromTocLink: false,
            })
        ).toBeNull();
    });

    it('offers to go back after following a ToC link into a different space', () => {
        expect(
            resolveBackToSpace({
                current: programmersGuide,
                lastLocation: gettingStarted,
                storedBack: null,
                fromTocLink: true,
            })
        ).toEqual(gettingStarted);
    });

    it('does not offer to go back when reaching a different space without a ToC link', () => {
        // e.g. an in-content text link, the section/variant picker, a direct URL or the
        // browser history — none of which should surface the shortcut.
        expect(
            resolveBackToSpace({
                current: programmersGuide,
                lastLocation: gettingStarted,
                storedBack: null,
                fromTocLink: false,
            })
        ).toBeNull();
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
                fromTocLink: false,
            })
        ).toEqual(gettingStarted);
    });

    it('clears the back target once the reader returns to the space they came from', () => {
        expect(
            resolveBackToSpace({
                current: gettingStarted,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromTocLink: false,
            })
        ).toBeNull();
    });

    it('points back to the most recent space when chaining cross-space ToC links', () => {
        // Was in Getting Started (stored back), followed a ToC link from the Programmer's
        // Guide into the API Reference: back should now point to the Programmer's Guide.
        expect(
            resolveBackToSpace({
                current: apiReference,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromTocLink: true,
            })
        ).toEqual(programmersGuide);
    });

    it('clears an existing back target when reaching a new space without a ToC link', () => {
        expect(
            resolveBackToSpace({
                current: apiReference,
                lastLocation: programmersGuide,
                storedBack: gettingStarted,
                fromTocLink: false,
            })
        ).toBeNull();
    });
});
