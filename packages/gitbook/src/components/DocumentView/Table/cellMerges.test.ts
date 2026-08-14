import { describe, expect, it } from 'bun:test';

import type { DocumentBlockTable, DocumentTableDefinition } from '@gitbook/api';

import { createTableCellMergeLayout, getMergedCellWidth, getTableCellMerge } from './cellMerges';

const RECORD_ORDER = ['first', 'second', 'third'];
const COLUMN_ORDER = ['a', 'b', 'c'];

function createBlock(
    cellMerges?: unknown[],
    options: {
        columns?: string[];
        definitions?: Record<string, DocumentTableDefinition>;
        viewType?: 'grid' | 'cards';
    } = {}
) {
    const columns = options.columns ?? COLUMN_ORDER;
    const definitions =
        options.definitions ??
        Object.fromEntries(columns.map((column) => [column, createDefinition('text', column)]));
    return {
        data: {
            view:
                options.viewType === 'cards'
                    ? { type: 'cards', columns }
                    : { type: 'grid', columns },
            records: Object.fromEntries(
                RECORD_ORDER.map((recordId, index) => [
                    recordId,
                    { orderIndex: `${index}`, values: {} },
                ])
            ),
            definition: definitions,
            ...(cellMerges ? { cellMerges } : {}),
        },
    } as unknown as DocumentBlockTable;
}

function createDefinition(type: DocumentTableDefinition['type'], id: string) {
    const base = { id, title: id };
    switch (type) {
        case 'text':
            return { ...base, type, textAlignment: 'left' } as DocumentTableDefinition;
        case 'users':
            return { ...base, type, multiple: true } as DocumentTableDefinition;
        case 'rating':
            return { ...base, type, max: 5 } as DocumentTableDefinition;
        case 'select':
            return { ...base, type, multiple: true, options: [] } as DocumentTableDefinition;
        default:
            return { ...base, type } as DocumentTableDefinition;
    }
}

describe('createTableCellMergeLayout', () => {
    it('classifies horizontal and vertical anchors and covered cells', () => {
        const layout = createTableCellMergeLayout(
            createBlock([
                { records: ['first'], columns: ['a', 'b'] },
                { records: ['second', 'third'], columns: ['c'] },
            ]),
            RECORD_ORDER
        );

        expect(getTableCellMerge(layout, 'first', 'a')).toMatchObject({
            isAnchor: true,
            merge: { rowSpan: 1, colSpan: 2, columns: ['a', 'b'] },
        });
        expect(getTableCellMerge(layout, 'first', 'b')).toMatchObject({ isAnchor: false });
        expect(getTableCellMerge(layout, 'second', 'c')).toMatchObject({
            isAnchor: true,
            merge: { rowSpan: 2, colSpan: 1, records: ['second', 'third'] },
        });
        expect(getTableCellMerge(layout, 'third', 'c')).toMatchObject({ isAnchor: false });
        expect(getTableCellMerge(layout, 'second', 'a')).toBeUndefined();
        expect(layout.hasVerticalMerges).toBe(true);
        expect(layout.verticalRecordGroups).toEqual([['second', 'third']]);
    });

    it('treats missing metadata and cards as unmerged layouts', () => {
        const missing = createTableCellMergeLayout(createBlock(), RECORD_ORDER);
        const cards = createTableCellMergeLayout(
            createBlock([{ records: ['first'], columns: ['a', 'b'] }], {
                viewType: 'cards',
            }),
            RECORD_ORDER
        );

        expect(missing.cells.size).toBe(0);
        expect(missing.hasVerticalMerges).toBe(false);
        expect(missing.verticalRecordGroups).toEqual([]);
        expect(cards.cells.size).toBe(0);
    });

    it.each([
        ['unknown record', { records: ['missing'], columns: ['a', 'b'] }],
        ['unknown column', { records: ['first'], columns: ['a', 'missing'] }],
        ['hidden column', { records: ['first'], columns: ['a', 'hidden'] }],
        ['reversed records', { records: ['second', 'first'], columns: ['a'] }],
        ['reversed columns', { records: ['first'], columns: ['b', 'a'] }],
        ['non-adjacent records', { records: ['first', 'third'], columns: ['a'] }],
        ['non-adjacent columns', { records: ['first'], columns: ['a', 'c'] }],
        ['rectangle', { records: ['first', 'second'], columns: ['a', 'b'] }],
        ['single cell', { records: ['first'], columns: ['a'] }],
        ['duplicate record', { records: ['first', 'first'], columns: ['a'] }],
        ['duplicate column', { records: ['first'], columns: ['a', 'a'] }],
        ['invalid shape', { records: 'first', columns: ['a', 'b'] }],
    ])('ignores malformed metadata: %s', (_name, merge) => {
        const block = createBlock([merge], {
            definitions: {
                a: createDefinition('text', 'a'),
                b: createDefinition('text', 'b'),
                c: createDefinition('text', 'c'),
                hidden: createDefinition('text', 'hidden'),
            },
        });
        const layout = createTableCellMergeLayout(block, RECORD_ORDER);

        expect(layout.cells.size).toBe(0);
        expect(layout.hasVerticalMerges).toBe(false);
    });

    it('keeps the first valid merge and ignores later overlaps and duplicates', () => {
        const layout = createTableCellMergeLayout(
            createBlock([
                { records: ['first'], columns: ['a', 'b'] },
                { records: ['first', 'second'], columns: ['b'] },
                { records: ['first'], columns: ['a', 'b'] },
            ]),
            RECORD_ORDER
        );

        expect(getTableCellMerge(layout, 'first', 'a')?.merge.columns).toEqual(['a', 'b']);
        expect(getTableCellMerge(layout, 'second', 'b')).toBeUndefined();
        expect(layout.hasVerticalMerges).toBe(false);
    });

    it('supports ordinary, horizontal, and vertical positions for Text and Number fields', () => {
        for (const type of ['text', 'number'] as const) {
            const definitions = {
                a: createDefinition(type, 'a'),
                b: createDefinition(type, 'b'),
            };
            const options = { columns: ['a', 'b'], definitions };
            const ordinary = createTableCellMergeLayout(
                createBlock(undefined, options),
                RECORD_ORDER
            );
            const horizontal = createTableCellMergeLayout(
                createBlock([{ records: ['first'], columns: ['a', 'b'] }], options),
                RECORD_ORDER
            );
            const vertical = createTableCellMergeLayout(
                createBlock([{ records: ['first', 'second'], columns: ['a'] }], options),
                RECORD_ORDER
            );

            expect(getTableCellMerge(ordinary, 'first', 'a'), type).toBeUndefined();
            expect(getTableCellMerge(horizontal, 'first', 'a'), type).toMatchObject({
                isAnchor: true,
                merge: { colSpan: 2 },
            });
            expect(getTableCellMerge(horizontal, 'first', 'b'), type).toMatchObject({
                isAnchor: false,
            });
            expect(getTableCellMerge(vertical, 'first', 'a'), type).toMatchObject({
                isAnchor: true,
                merge: { rowSpan: 2 },
            });
            expect(getTableCellMerge(vertical, 'second', 'a'), type).toMatchObject({
                isAnchor: false,
            });
        }
    });

    it.each(['checkbox', 'select', 'rating', 'users', 'files', 'image', 'content-ref'] as const)(
        'ignores horizontal and vertical merges for unsupported %s fields',
        (type) => {
            const definitions = {
                a: createDefinition(type, 'a'),
                b: createDefinition(type, 'b'),
            };
            const options = { columns: ['a', 'b'], definitions };
            const horizontal = createTableCellMergeLayout(
                createBlock([{ records: ['first'], columns: ['a', 'b'] }], options),
                RECORD_ORDER
            );
            const vertical = createTableCellMergeLayout(
                createBlock([{ records: ['first', 'second'], columns: ['a'] }], options),
                RECORD_ORDER
            );

            expect(horizontal.cells.size).toBe(0);
            expect(vertical.cells.size).toBe(0);
            expect(vertical.hasVerticalMerges).toBe(false);
        }
    );

    it('ignores horizontal merges mixing Text and Number fields', () => {
        const layout = createTableCellMergeLayout(
            createBlock([{ records: ['first'], columns: ['a', 'b'] }], {
                columns: ['a', 'b'],
                definitions: {
                    a: createDefinition('text', 'a'),
                    b: createDefinition('number', 'b'),
                },
            }),
            RECORD_ORDER
        );

        expect(layout.cells.size).toBe(0);
    });
});

describe('getMergedCellWidth', () => {
    it('returns a single column width unchanged', () => {
        expect(getMergedCellWidth(['100px'])).toBe('100px');
    });

    it('adds fixed and automatic column widths in CSS', () => {
        expect(getMergedCellWidth(['120px', 'clamp(100px, calc(100% / 2), 100%)'])).toBe(
            'calc(120px + clamp(100px, calc(100% / 2), 100%))'
        );
    });
});
