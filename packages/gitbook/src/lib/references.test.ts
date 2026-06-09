import { describe, expect, it } from 'bun:test';
import type { Revision, RevisionPageDocument, Space } from '@gitbook/api';

import type { GitBookAnyContext } from '@/lib/context';
import type { GitBookDataFetcher } from '@/lib/data';
import { createLinker } from '@/lib/links';
import { resolveContentRef, resolveStringContentRef } from './references';

describe('resolveStringContentRef', () => {
    it.each([
        {
            label: 'an external URL',
            input: 'https://docs.gitbook.com/product-tour',
            expected: {
                kind: 'url',
                url: 'https://docs.gitbook.com/product-tour',
            },
        },
        {
            label: 'a page ref in the current space',
            input: '/pages/page_123',
            expected: {
                kind: 'page',
                page: 'page_123',
            },
        },
        {
            label: 'a page ref in another space',
            input: '/spaces/space-123/pages/page_123',
            expected: {
                kind: 'page',
                space: 'space-123',
                page: 'page_123',
            },
        },
        {
            label: 'an anchor in the current page',
            input: '#heading-1',
            expected: {
                kind: 'anchor',
                anchor: 'heading-1',
            },
        },
        {
            label: 'an anchor on a page in another space',
            input: '/spaces/space-123/pages/page-123#heading_1',
            expected: {
                kind: 'anchor',
                space: 'space-123',
                page: 'page-123',
                anchor: 'heading_1',
            },
        },
        {
            label: 'a file ref',
            input: '/spaces/space-123/files/file_123',
            expected: {
                kind: 'file',
                space: 'space-123',
                file: 'file_123',
            },
        },
        {
            label: 'a space ref',
            input: '/spaces/space-123',
            expected: {
                kind: 'space',
                space: 'space-123',
            },
        },
        {
            label: 'a collection ref',
            input: '/collections/collection-123',
            expected: {
                kind: 'collection',
                collection: 'collection-123',
            },
        },
        {
            label: 'a user ref',
            input: '/users/user_123',
            expected: {
                kind: 'user',
                user: 'user_123',
            },
        },
        {
            label: 'a reusable content ref',
            input: '/spaces/space-123/reusable-content/reusable_123',
            expected: {
                kind: 'reusable-content',
                space: 'space-123',
                reusableContent: 'reusable_123',
            },
        },
        {
            label: 'a tag ref',
            input: '/spaces/space-123/tags/tag_123',
            expected: {
                kind: 'tag',
                space: 'space-123',
                tag: 'tag_123',
            },
        },
        {
            label: 'an OpenAPI ref',
            input: '/openapi/spec-v1',
            expected: {
                kind: 'openapi',
                spec: 'spec-v1',
            },
        },
    ])('parses $label', ({ input, expected }) => {
        // @ts-expect-error
        expect(resolveStringContentRef(input)).toEqual(expected);
    });

    it.each([
        {
            label: 'a relative page path',
            input: 'getting-started',
        },
        {
            label: 'a page path with an extra segment',
            input: '/pages/page-123/child',
        },
        {
            label: 'a missing page identifier',
            input: '/pages/',
        },
        {
            label: 'a space path with a trailing slash',
            input: '/spaces/space-123/',
        },
        {
            label: 'an OpenAPI path with nested segments',
            input: '/openapi/spec/v1',
        },
    ])('returns null for $label', ({ input }) => {
        expect(resolveStringContentRef(input)).toBeNull();
    });
});

describe('resolveContentRef', () => {
    it("resolves a page in a different space using that space's page data, not the current context page", async () => {
        const sharedPageId = 'page-shared';

        const spaceAPage = {
            object: 'page',
            id: sharedPageId,
            type: 'document',
            kind: 'sheet',
            title: 'Space A Page',
            path: 'space-a-page',
            slug: 'space-a-page',
            pages: [],
            tags: [],
            layout: {},
            urls: { app: 'https://app.gitbook.com/page' },
        } as unknown as RevisionPageDocument;

        const spaceBPage = {
            object: 'page',
            id: sharedPageId,
            type: 'document',
            kind: 'sheet',
            title: 'Space B Page',
            path: 'space-b-page',
            slug: 'space-b-page',
            pages: [],
            tags: [],
            layout: {},
            urls: { app: 'https://app.gitbook.com/page' },
        } as unknown as RevisionPageDocument;

        const revisionA = {
            object: 'revision',
            id: 'rev-a',
            type: 'edits',
            pages: [spaceAPage],
            files: [],
            reusableContents: [],
            tags: [],
            parents: [],
            createdAt: '',
            urls: { app: '' },
        } as unknown as Revision;

        const revisionB = {
            object: 'revision',
            id: 'rev-b',
            type: 'edits',
            pages: [spaceBPage],
            files: [],
            reusableContents: [],
            tags: [],
            parents: [],
            createdAt: '',
            urls: { app: '' },
        } as unknown as Revision;

        const spaceA = {
            object: 'space',
            id: 'space-a',
            title: 'Space A',
            organization: 'org',
            revision: 'rev-a',
            urls: {
                location: 'https://api.gitbook.com/spaces/space-a',
                app: 'https://app.gitbook.com/o/org/s/space-a/',
                published: 'https://space-a.gitbook.io/',
            },
        } as unknown as Space;

        const spaceB = {
            object: 'space',
            id: 'space-b',
            title: 'Space B',
            organization: 'org',
            revision: 'rev-b',
            urls: {
                location: 'https://api.gitbook.com/spaces/space-b',
                app: 'https://app.gitbook.com/o/org/s/space-b/',
                published: 'https://space-b.gitbook.io/',
            },
        } as unknown as Space;

        const dataFetcher = {
            getSpace: async ({ spaceId }: { spaceId: string; shareKey: string | undefined }) => {
                if (spaceId === 'space-b') return { data: spaceB };
                return { error: { code: 404, message: 'Not found' } };
            },
            getRevision: async ({ spaceId }: { spaceId: string; revisionId: string }) => {
                if (spaceId === 'space-b') return { data: revisionB };
                return { error: { code: 404, message: 'Not found' } };
            },
            getChangeRequest: async () => ({ error: { code: 404, message: 'Not found' } }),
            withToken: function () {
                return this;
            },
        } as unknown as GitBookDataFetcher;

        const context: GitBookAnyContext = {
            dataFetcher,
            linker: createLinker({
                host: 'docs.example.com',
                spaceBasePath: '/space-a/',
                siteBasePath: '/',
            }),
            organizationId: 'org',
            space: spaceA,
            revision: revisionA,
            revisionId: 'rev-a',
            changeRequest: null,
            shareKey: undefined,
            // This page (from space A) has the same ID as the target page in space B.
            // It should NOT contaminate resolution in space B.
            page: spaceAPage,
        } as unknown as GitBookAnyContext;

        const result = await resolveContentRef(
            { kind: 'page', space: 'space-b', page: sharedPageId },
            context
        );

        expect(result?.text).toBe('Space B Page');
    });
});
