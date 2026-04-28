import { describe, expect, it } from 'bun:test';

import { resolveStringContentRef } from './references';

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
