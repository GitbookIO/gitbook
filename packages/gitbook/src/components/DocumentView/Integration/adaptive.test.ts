import { describe, expect, it } from 'bun:test';
import type { ContentKitRenderOutput, ContentKitWebFrame } from '@gitbook/api';

import type { GitBookAnyContext } from '@/lib/context';
import { createLinker } from '@/lib/links';
import { getWebframePageContext, integrationBlockContainsWebframe } from './adaptive';

const webframe: ContentKitWebFrame = {
    type: 'webframe',
    source: { url: 'https://integrations.gitbook.com/frame' },
};

function elementOutput(element: unknown): ContentKitRenderOutput {
    return {
        type: 'element',
        element,
        state: {},
        props: {},
    } as ContentKitRenderOutput;
}

describe('integrationBlockContainsWebframe', () => {
    it('returns false for a completed output', () => {
        expect(integrationBlockContainsWebframe({ type: 'complete' })).toBe(false);
    });

    it('returns false when there is no webframe in the tree', () => {
        const output = elementOutput({
            type: 'block',
            children: [{ type: 'text', text: 'hello' }],
        } as never);
        expect(integrationBlockContainsWebframe(output)).toBe(false);
    });

    it('returns true when a webframe is nested in the tree', () => {
        const output = elementOutput({
            type: 'block',
            children: [{ type: 'vstack', children: [webframe] }],
        } as never);
        expect(integrationBlockContainsWebframe(output)).toBe(true);
    });
});

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
