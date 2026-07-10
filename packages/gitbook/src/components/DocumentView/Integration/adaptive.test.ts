import { describe, expect, it } from 'bun:test';
import type { ContentKitRenderOutput, ContentKitWebFrame } from '@gitbook/api';

import type { GitBookAnyContext } from '@/lib/context';
import {
    getWebframePageContext,
    getWebframePagePaths,
    integrationBlockContainsWebframe,
} from './adaptive';

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

    it('returns the page id, path and title when a page is present', () => {
        const context = {
            page: {
                id: 'page-1',
                path: 'guides/getting-started',
                title: 'Getting started',
                slug: 'getting-started',
            },
        } as unknown as GitBookAnyContext;

        expect(getWebframePageContext(context)).toEqual({
            id: 'page-1',
            path: 'guides/getting-started',
            title: 'Getting started',
        });
    });
});

describe('getWebframePagePaths', () => {
    it('returns an empty map when the context has no revision', () => {
        const context = { space: { id: 'space-1' } } as unknown as GitBookAnyContext;
        expect(getWebframePagePaths(context)).toEqual({});
    });

    it('maps document page ids to their path, skipping links and walking groups', () => {
        const context = {
            revision: {
                pages: [
                    { id: 'p1', type: 'document', path: 'intro', slug: 'intro', pages: [] },
                    {
                        id: 'g1',
                        type: 'group',
                        pages: [
                            {
                                id: 'p2',
                                type: 'document',
                                path: 'group/child',
                                slug: 'child',
                                pages: [],
                            },
                        ],
                    },
                    { id: 'l1', type: 'link', target: { kind: 'url', url: 'https://x.com' } },
                ],
            },
        } as unknown as GitBookAnyContext;

        expect(getWebframePagePaths(context)).toEqual({
            // The first document resolves to the empty (root) path.
            p1: '',
            p2: 'group/child',
        });
    });
});
