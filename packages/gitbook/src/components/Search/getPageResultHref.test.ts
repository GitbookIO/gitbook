import { describe, expect, it } from 'bun:test';

import { getPageResultHref } from './getPageResultHref';

const pageResult = {
    href: '/getting-started',
    bestSection: {
        href: '/getting-started#installation',
        title: 'Installation',
        body: 'Install the application.',
        score: 1,
    },
};

describe('getPageResultHref', () => {
    it('links page matches to the top of the page', () => {
        expect(getPageResultHref({ ...pageResult, resultType: 'page' })).toBe('/getting-started');
    });

    it('links section matches to the matching section', () => {
        expect(getPageResultHref({ ...pageResult, resultType: 'section' })).toBe(
            '/getting-started#installation'
        );
    });

    it('preserves anchored links when the result type is absent', () => {
        expect(getPageResultHref(pageResult)).toBe('/getting-started#installation');
    });

    it('links to the page when no section preview is available', () => {
        expect(getPageResultHref({ href: '/getting-started', resultType: 'section' })).toBe(
            '/getting-started'
        );
    });
});
