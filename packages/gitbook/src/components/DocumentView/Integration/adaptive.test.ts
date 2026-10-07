import { describe, expect, it } from 'bun:test';

import { getWebframePageContext } from './adaptive';
import type { GitBookAnyContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

describe('getWebframePageContext', () => {
    it('returns null when the context has no page', () => {
        const context = { space: { id: 'space-1' } } as unknown as GitBookAnyContext;
        expect(getWebframePageContext(context)).toBeNull();
    });

    it('resolves the page path relative to the site root, including the section slug', () => {
        const context = {
            page: {
                id: 'page-1',
                path: 'guides/getting-started',
                title: 'Getting started',
                slug: 'getting-started',
            },
            // Site served at /docs, with the page's space mounted under the `api` section.
            linker: createLinker({ siteBasePath: '/docs/', spaceBasePath: '/docs/api/' }),
        } as unknown as GitBookAnyContext;

        expect(getWebframePageContext(context)).toEqual({
            id: 'page-1',
            path: 'api/guides/getting-started',
            title: 'Getting started',
        });
    });

    it('leaves the path unprefixed when the space is served at the site root', () => {
        const context = {
            page: {
                id: 'page-2',
                path: 'guides/getting-started',
                title: 'Getting started',
                slug: 'getting-started',
            },
            linker: createLinker({ siteBasePath: '/', spaceBasePath: '/' }),
        } as unknown as GitBookAnyContext;

        expect(getWebframePageContext(context)).toEqual({
            id: 'page-2',
            path: 'guides/getting-started',
            title: 'Getting started',
        });
    });
});
