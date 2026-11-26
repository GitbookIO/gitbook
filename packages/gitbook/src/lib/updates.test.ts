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
    countDocumentUpdates,
    findUpdateAnchorPage,
    paginateUpdatesDocument,
    parseUpdatesPageParam,
    getDocumentFilterableTags,
    normalizeUpdatesFilterTags,
} from './updates';

describe('getDocumentFilterableTags', () => {
    it('ignores category and deleted references without removing their stored assignments', () => {
        const document = createUpdatesDocument([['category', 'constructor', 'missing']]);
        const category = { ...createTag('category', 'Products'), kind: 'category' as const };
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

describe('updates pagination', () => {
    it('keeps a 50-entry document intact and paginates 51 entries across two blocks', () => {
        const short = createUpdatesDocument(Array.from({ length: 50 }, () => []));
        expect(paginateUpdatesDocument(short, undefined, { page: 2 })).toEqual({
            document: short,
            pagination: null,
        });
        expect(paginateUpdatesDocument(short, undefined, { page: 2 }).document).toBe(short);

        const long = createUpdatesDocument(
            Array.from({ length: 51 }, () => []),
            25
        );
        expect(countDocumentUpdates(long)).toBe(51);
        for (const [page, start, end, blockTypes] of [
            [1, 1, 20, ['updates', 'paragraph']],
            [2, 21, 40, ['updates', 'paragraph', 'updates']],
            [3, 41, 51, ['paragraph', 'updates']],
        ] as const) {
            const result = paginateUpdatesDocument(long, undefined, { page });
            expect(result.pagination).toEqual({
                page,
                totalPages: 3,
                totalItems: 51,
                pageSize: 20,
                start,
                end,
                isClamped: false,
            });
            expect(getUpdateIds(result.document)).toEqual(
                Array.from({ length: end - start + 1 }, (_, i) => `update-${start + i}`)
            );
            expect(result.document.nodes.map((block) => block.type)).toEqual([...blockTypes]);
        }
    });

    it('keeps the first and seventh slices of a 260-entry changelog to 20 entries each', () => {
        const document = createUpdatesDocument(
            Array.from({ length: 260 }, () => []),
            135
        );
        for (const [page, start] of [
            [1, 1],
            [7, 121],
        ] as const) {
            const result = paginateUpdatesDocument(document, undefined, { page });
            expect(result.pagination).toMatchObject({
                page,
                totalPages: 13,
                start,
                end: start + 19,
            });
            expect(getUpdateIds(result.document)).toEqual(
                Array.from({ length: 20 }, (_, i) => `update-${start + i}`)
            );
        }
    });

    it('filters by any selected tag before calculating page bounds and clamps to the last match', () => {
        const revision = {
            tags: [createTag('odd', 'Odd'), createTag('even', 'Even')],
        } as unknown as Revision;
        const document = createUpdatesDocument(
            Array.from({ length: 61 }, (_, index) => {
                if (index % 3 === 0) {
                    return ['odd'];
                }
                if (index % 3 === 1) {
                    return ['even'];
                }
                return [];
            }),
            30
        );

        const result = paginateUpdatesDocument(document, revision, {
            page: 9,
            tags: [' odd ', 'even', 'unknown'],
        });
        expect(result.pagination).toMatchObject({
            page: 3,
            totalPages: 3,
            totalItems: 41,
            start: 41,
            end: 41,
            isClamped: true,
        });
        expect(getUpdateIds(result.document)).toEqual(['update-61']);
        expect(countDocumentUpdates(document)).toBe(61);
    });

    it('finds a nested anchor on the filtered page or clears a filter that excludes it', () => {
        const revision = { tags: [createTag('fixes', 'Fixes')] } as unknown as Revision;
        const document = createUpdatesDocument(
            Array.from({ length: 61 }, (_, index) => {
                if (index % 2 === 0) {
                    return ['fixes'];
                }
                return [];
            }),
            26
        );
        expect(
            findUpdateAnchorPage(document, revision, { anchor: 'update-43', tags: ['fixes'] })
        ).toEqual({ found: true, page: 2, clearTags: false });
        expect(
            findUpdateAnchorPage(document, revision, { anchor: 'update-44', tags: ['fixes'] })
        ).toEqual({ found: true, page: 3, clearTags: true });
        expect(
            findUpdateAnchorPage(document, revision, { anchor: 'missing', tags: ['fixes'] })
        ).toEqual({ found: false });

        const tabUpdate = document.nodes[0];
        if (tabUpdate?.type === 'updates' && tabUpdate.nodes[20]?.type === 'update') {
            tabUpdate.nodes[20].nodes.push({
                object: 'block',
                type: 'tabs',
                key: 'tabs-block',
                data: {},
                isVoid: false,
                nodes: [
                    {
                        object: 'block',
                        type: 'tabs-item',
                        key: 'legacy-tab-key',
                        data: { title: 'Tab' },
                        isVoid: false,
                        nodes: [],
                    },
                ],
            });
        }
        expect(findUpdateAnchorPage(document, revision, { anchor: 'legacy-tab-key' })).toEqual({
            found: true,
            page: 2,
            clearTags: false,
        });
    });
});

describe('parseUpdatesPageParam', () => {
    it.each([null, undefined, '1', '0', '-1', 'abc', '501', '2.5', '2e1', '02', ' 2', '2\n'])(
        'rejects %s',
        (param) => {
            expect(parseUpdatesPageParam(param)).toBeNull();
        }
    );

    it.each([2, 500])('accepts %s', (page) => {
        expect(parseUpdatesPageParam(String(page))).toBe(page);
    });
});

function getUpdateIds(document: JSONDocument) {
    return document.nodes.flatMap((block) => {
        if (block.type !== 'updates') {
            return [];
        }
        return block.nodes.map((entry) => {
            const heading = entry.nodes[0];
            if (heading?.type === 'heading-1') {
                return heading.meta?.id;
            }
        });
    });
}

function createUpdatesDocument(entryTags: string[][], splitAt?: number): JSONDocument {
    const entries = entryTags.map((tags, index) => ({
        object: 'block' as const,
        type: 'update' as const,
        data: {
            date: '2026-05-01',
            tags: tags.map((tag) => ({ kind: 'tag' as const, tag })),
        },
        isVoid: false as const,
        nodes: [
            {
                object: 'block' as const,
                type: 'heading-1' as const,
                meta: { id: `update-${index + 1}` },
                data: {},
                isVoid: false as const,
                nodes: [],
            },
        ],
    }));
    const updates = (nodes: typeof entries) => ({
        object: 'block' as const,
        type: 'updates' as const,
        data: { format: 'full' as const },
        isVoid: false as const,
        nodes,
    });
    const nodes: JSONDocument['nodes'] = [updates(entries)];
    if (splitAt !== undefined) {
        nodes.splice(
            0,
            1,
            updates(entries.slice(0, splitAt)),
            { object: 'block', type: 'paragraph', data: {}, isVoid: false, nodes: [] },
            updates(entries.slice(splitAt))
        );
    }

    return { object: 'document', data: { schemaVersion: 2 }, nodes };
}

function createTag(slug: string, label: string): RevisionTag {
    return {
        slug,
        label,
        color: DocumentTextColor.Default,
        icon: undefined,
    };
}
