import { describe, expect, it } from 'bun:test';

import {
    type DocumentBlockHeading,
    type DocumentBlockParagraph,
    type DocumentBlockUpdate,
    type DocumentBlockUpdates,
    DocumentTextColor,
    type JSONDocument,
    type Revision,
    type RevisionTag,
} from '@gitbook/api';

import { getRevisionTags, resolveBlockTags, resolveTag } from './tags';
import {
    UPDATES_TAG_FILTER_CAP,
    type UpdatesPaginationEligibility,
    findUpdateAnchorPage,
    getUpdatesPaginationEligibility,
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
    it('paginates a single top-level updates block and keeps the surrounding blocks', () => {
        const document = createDocument([
            createHeading('intro'),
            createParagraph(),
            createUpdatesBlock(createUpdateEntries(260)),
            createParagraph(),
        ]);
        for (const [page, start] of [
            [1, 1],
            [7, 121],
        ] as const) {
            const result = paginateUpdatesDocument(document, undefined, { page });
            expect(result.pagination).toEqual({
                page,
                totalPages: 13,
                totalItems: 260,
                pageSize: 20,
                start,
                end: start + 19,
                isClamped: false,
            });
            expect(getUpdateIds(result.document)).toEqual(
                Array.from({ length: 20 }, (_, i) => `update-${start + i}`)
            );
            expect(result.document.nodes.map((block) => block.type)).toEqual([
                'heading-1',
                'paragraph',
                'updates',
                'paragraph',
            ]);
        }
    });

    it('keeps 50 entries intact and paginates 51', () => {
        const short = createDocument([createUpdatesBlock(createUpdateEntries(50))]);
        expect(getUpdatesPaginationEligibility(short)).toEqual({ status: 'below-threshold' });
        const shortResult = paginateUpdatesDocument(short, undefined, { page: 2 });
        expect(shortResult.pagination).toBeNull();
        expect(shortResult.document).toBe(short);

        const long = createDocument([createUpdatesBlock(createUpdateEntries(51))]);
        const eligibility = getUpdatesPaginationEligibility(long);
        expect(eligibility.status).toBe('eligible');
        if (eligibility.status === 'eligible') {
            expect(eligibility.updates).toHaveLength(51);
        }
        const result = paginateUpdatesDocument(long, undefined, { page: 3 });
        expect(result.pagination).toMatchObject({ page: 3, totalPages: 3, start: 41, end: 51 });
        expect(getUpdateIds(result.document)).toEqual(
            Array.from({ length: 11 }, (_, i) => `update-${41 + i}`)
        );
    });

    it.each([
        [25, 26],
        [60, 10],
    ])('does not paginate two top-level updates blocks of %i and %i entries', (first, second) => {
        const entries = createUpdateEntries(first + second);
        const document = createDocument([
            createUpdatesBlock(entries.slice(0, first)),
            createParagraph(),
            createUpdatesBlock(entries.slice(first)),
        ]);
        expectNotPaginated(document, {
            status: 'skipped',
            reason: 'multiple-updates-blocks',
            totalUpdates: first + second,
            updatesBlocks: 2,
        });
    });

    it('does not paginate when another updates block is nested inside a container', () => {
        const entries = createUpdateEntries(62);
        const document = createDocument([
            createUpdatesBlock(entries.slice(0, 60)),
            wrapInIf(createUpdatesBlock(entries.slice(60))),
        ]);
        expectNotPaginated(document, {
            status: 'skipped',
            reason: 'nested-updates-block',
            totalUpdates: 62,
            updatesBlocks: 2,
        });
    });

    it('does not paginate an updates block that is only nested', () => {
        const document = createDocument([wrapInIf(createUpdatesBlock(createUpdateEntries(60)))]);
        expectNotPaginated(document, { status: 'below-threshold' });
    });

    it('does not paginate an updates block with non-update entries', () => {
        const entries = createUpdateEntries(60);
        const document = createDocument([
            createUpdatesBlock([
                ...entries.slice(0, 30),
                {
                    object: 'block',
                    type: 'if',
                    data: { expression: 'visitor.claims.beta' },
                    isVoid: false,
                    nodes: entries.slice(30, 32),
                },
                ...entries.slice(32),
            ]),
        ]);
        expectNotPaginated(document, {
            status: 'skipped',
            reason: 'non-update-entries',
            totalUpdates: 59,
            updatesBlocks: 1,
        });
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
            })
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
    });

    it('finds a nested anchor on the filtered page or clears a filter that excludes it', () => {
        const revision = { tags: [createTag('fixes', 'Fixes')] } as unknown as Revision;
        const document = createUpdatesDocument(
            Array.from({ length: 61 }, (_, index) => {
                if (index % 2 === 0) {
                    return ['fixes'];
                }
                return [];
            })
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

function expectNotPaginated(document: JSONDocument, eligibility: UpdatesPaginationEligibility) {
    expect(getUpdatesPaginationEligibility(document)).toEqual(eligibility);
    const result = paginateUpdatesDocument(document, undefined, { page: 2 });
    expect(result).toEqual({
        document,
        pagination: null,
        eligibility,
    });
    expect(result.document).toBe(document);
    expect(findUpdateAnchorPage(document, undefined, { anchor: 'update-1' })).toEqual({
        found: true,
        page: null,
        clearTags: false,
    });
    expect(findUpdateAnchorPage(document, undefined, { anchor: 'missing' })).toEqual({
        found: false,
    });
}

function createUpdatesDocument(entryTags: string[][]): JSONDocument {
    return createDocument([createUpdatesBlock(createUpdateEntries(entryTags.length, entryTags))]);
}

function createDocument(nodes: JSONDocument['nodes']): JSONDocument {
    return { object: 'document', data: { schemaVersion: 2 }, nodes };
}

function createUpdateEntries(count: number, entryTags: string[][] = []): DocumentBlockUpdate[] {
    return Array.from({ length: count }, (_, index) => ({
        object: 'block',
        type: 'update',
        data: {
            date: '2026-05-01',
            tags: (entryTags[index] ?? []).map((tag) => ({ kind: 'tag', tag })),
        },
        isVoid: false,
        nodes: [createHeading(`update-${index + 1}`)],
    }));
}

function createUpdatesBlock(nodes: DocumentBlockUpdates['nodes']): DocumentBlockUpdates {
    return { object: 'block', type: 'updates', data: { format: 'full' }, isVoid: false, nodes };
}

function wrapInIf(block: DocumentBlockUpdates): JSONDocument['nodes'][number] {
    return {
        object: 'block',
        type: 'if',
        data: { expression: 'visitor.claims.beta' },
        isVoid: false,
        nodes: [block],
    };
}

function createHeading(id: string): DocumentBlockHeading {
    return {
        object: 'block',
        type: 'heading-1',
        meta: { id },
        data: {},
        isVoid: false,
        nodes: [],
    };
}

function createParagraph(): DocumentBlockParagraph {
    return { object: 'block', type: 'paragraph', data: {}, isVoid: false, nodes: [] };
}

function createTag(slug: string, label: string): RevisionTag {
    return {
        slug,
        label,
        color: DocumentTextColor.Default,
        icon: undefined,
    };
}
