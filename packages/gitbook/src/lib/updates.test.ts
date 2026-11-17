import { describe, expect, it } from 'bun:test';

import {
    DocumentTextColor,
    type JSONDocument,
    type Revision,
    type RevisionTag,
} from '@gitbook/api';

import { getRevisionTags, resolveBlockTags, resolveTag } from './tags';
import {
    UPDATES_TAG_FILTER_CAP,
    getDocumentFilterableTags,
    normalizeUpdatesFilterTags,
} from './updates';

describe('getDocumentFilterableTags', () => {
    it('ignores category and deleted references without removing their stored assignments', () => {
        const document = createUpdatesDocument([['category', 'constructor', 'missing']]);
        const category = { ...createTag('category', 'Products'), kind: 'category' };
        const normal = createTag('constructor', 'Constructor');
        const revision = { tags: [category, normal] } as unknown as Revision;
        const before = JSON.stringify(document);
        expect(getDocumentFilterableTags(document, revision).map((tag) => tag.slug)).toEqual([
            'constructor',
        ]);
        expect(resolveTag('category', revision.tags)).toBeUndefined();
        expect(resolveTag('missing', revision.tags)).toBeUndefined();
        expect(resolveTag('constructor', revision.tags)).toEqual(normal);
        expect(getRevisionTags(revision)).toEqual([category, normal]);
        expect(JSON.stringify(document)).toBe(before);
    });

    it('rejects category assignments even when definitions are passed directly to the resolver', () => {
        const normal = createTag('beta', 'Beta');
        const tags = [
            { ...createTag('products', 'Products'), kind: 'category' },
            normal,
        ] satisfies (RevisionTag & { kind?: 'category' })[];
        expect(
            resolveBlockTags(
                [
                    { kind: 'tag', tag: 'products' },
                    { kind: 'tag', tag: 'beta' },
                    { kind: 'tag', tag: 'missing' },
                ],
                tags
            )
        ).toEqual([normal]);
    });

    it('returns unique update tags in document order', () => {
        const document = createUpdatesDocument([
            ['improvements', 'fixes'],
            ['new-releases'],
            ['fixes'],
            ['unknown'],
        ]);
        const revision = {
            tags: [
                createTag('new-releases', 'New releases'),
                createTag('fixes', 'Fixes'),
                createTag('improvements', 'Improvements'),
            ],
        } as unknown as Revision;

        expect(getDocumentFilterableTags(document, revision).map((tag) => tag.slug)).toEqual([
            'improvements',
            'fixes',
            'new-releases',
        ]);
    });
});

describe('normalizeUpdatesFilterTags', () => {
    it('trims, validates, deduplicates, and caps tags', () => {
        const availableTags = new Set([
            'fixes',
            ...Array.from({ length: UPDATES_TAG_FILTER_CAP }, (_, index) => `tag-${index}`),
        ]);
        const tags = [
            ' fixes ',
            'unknown',
            'fixes',
            ...Array.from({ length: UPDATES_TAG_FILTER_CAP }, (_, index) => `tag-${index}`),
        ];

        expect(normalizeUpdatesFilterTags(tags, availableTags)).toEqual([
            'fixes',
            ...Array.from({ length: UPDATES_TAG_FILTER_CAP - 1 }, (_, index) => `tag-${index}`),
        ]);
    });
});

function createUpdatesDocument(entryTags: string[][]): JSONDocument {
    return {
        object: 'document',
        data: { schemaVersion: 2 },
        nodes: [
            {
                object: 'block',
                type: 'updates',
                data: { format: 'full' },
                isVoid: false,
                nodes: entryTags.map((tags, index) => ({
                    object: 'block',
                    type: 'update',
                    data: {
                        date: `2026-05-${String(index + 1).padStart(2, '0')}`,
                        tags: tags.map((tag) => ({ kind: 'tag', tag })),
                    },
                    isVoid: false,
                    nodes: [],
                })),
            },
        ],
    };
}

function createTag(slug: string, label: string): RevisionTag {
    return {
        slug,
        label,
        color: DocumentTextColor.Default,
        icon: undefined,
    };
}
