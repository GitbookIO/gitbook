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
        recordOrder?: string[];
        viewType?: 'grid' | 'cards';
    } = {}
) {
    const columns = options.columns ?? COLUMN_ORDER;
    const recordOrder = options.recordOrder ?? RECORD_ORDER;
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
                recordOrder.map((recordId, index) => [
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
    return type === 'text'
        ? ({ ...base, type, textAlignment: 'left' } as DocumentTableDefinition)
        : ({ ...base, type } as DocumentTableDefinition);
}

describe('createTableCellMergeLayout', () => {
    it('classifies horizontal and vertical Text and Number merges', () => {
        for (const type of ['text', 'number'] as const) {
            const layout = createTableCellMergeLayout(
                createBlock([horizontalMerge('first', 'a', 2), verticalMerge('second', 'c', 2)], {
                    definitions: Object.fromEntries(
                        COLUMN_ORDER.map((column) => [column, createDefinition(type, column)])
                    ),
                }),
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
            expect(layout.verticalRecordGroups).toEqual([['second', 'third']]);
            expect(layout.recordGroups).toEqual([['first'], ['second', 'third']]);
            expect(layout.hasVerticalMerges).toBe(true);
        }
    });

    it('treats missing metadata and Cards as unmerged layouts', () => {
        const missing = createTableCellMergeLayout(createBlock(), RECORD_ORDER);
        const cards = createTableCellMergeLayout(
            createBlock([horizontalMerge('first', 'a', 2)], {
                viewType: 'cards',
            }),
            RECORD_ORDER
        );

        expect(missing.cells.size).toBe(0);
        expect(missing.recordGroups).toEqual([['first'], ['second'], ['third']]);
        expect(missing.hasVerticalMerges).toBe(false);
        expect(cards.cells.size).toBe(0);
        expect(cards.recordGroups).toEqual([]);
    });

    it.each([
        ['invalid shape', { anchor: 'first', rowSpan: 1, colSpan: 2 }],
        ['single cell', { anchor: { record: 'first', column: 'a' }, rowSpan: 1, colSpan: 1 }],
        ['unknown record', horizontalMerge('missing', 'a', 2)],
        ['hidden column', horizontalMerge('first', 'hidden', 2)],
        ['out-of-bounds span', horizontalMerge('first', 'c', 2)],
        ['rectangle', { anchor: { record: 'first', column: 'a' }, rowSpan: 2, colSpan: 2 }],
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

    it('drops every conflicting merge regardless of order while preserving unrelated merges', () => {
        const horizontal = horizontalMerge('first', 'a', 2);
        const vertical = verticalMerge('first', 'b', 2);
        const duplicate = horizontalMerge('first', 'a', 2);
        const unrelated = verticalMerge('second', 'c', 2);

        for (const cellMerges of [
            [horizontal, vertical, duplicate, unrelated],
            [vertical, duplicate, horizontal, unrelated],
        ]) {
            const layout = createTableCellMergeLayout(createBlock(cellMerges), RECORD_ORDER);

            expect(getTableCellMerge(layout, 'first', 'a')).toBeUndefined();
            expect(getTableCellMerge(layout, 'first', 'b')).toBeUndefined();
            expect(getTableCellMerge(layout, 'second', 'b')).toBeUndefined();
            expect(getTableCellMerge(layout, 'second', 'c')).toMatchObject({
                isAnchor: true,
                merge: { records: ['second', 'third'], columns: ['c'] },
            });
            expect(getTableCellMerge(layout, 'third', 'c')).toMatchObject({ isAnchor: false });
            expect(layout.verticalRecordGroups).toEqual([['second', 'third']]);
            expect(layout.recordGroups).toEqual([['first'], ['second', 'third']]);
        }
    });

    it('partitions disjoint vertical merges and singleton records in record order', () => {
        const recordOrder = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
        const layout = createTableCellMergeLayout(
            createBlock([verticalMerge('fourth', 'b', 2), verticalMerge('first', 'a', 2)], {
                recordOrder,
            }),
            recordOrder
        );

        expect(layout.recordGroups).toEqual([
            ['first', 'second'],
            ['third'],
            ['fourth', 'fifth'],
            ['sixth'],
        ]);
    });

    it('combines transitively connected vertical merges regardless of metadata order', () => {
        for (const cellMerges of [
            [verticalMerge('first', 'a', 2), verticalMerge('second', 'b', 2)],
            [verticalMerge('second', 'b', 2), verticalMerge('first', 'a', 2)],
        ]) {
            const layout = createTableCellMergeLayout(createBlock(cellMerges), RECORD_ORDER);

            expect(layout.recordGroups).toEqual([['first', 'second', 'third']]);
        }
    });

    it('ignores merges for unsupported or mixed field types', () => {
        const unsupportedDefinitions = {
            a: createDefinition('checkbox', 'a'),
            b: createDefinition('checkbox', 'b'),
        };
        const unsupportedHorizontal = createTableCellMergeLayout(
            createBlock([horizontalMerge('first', 'a', 2)], {
                columns: ['a', 'b'],
                definitions: unsupportedDefinitions,
            }),
            RECORD_ORDER
        );
        const unsupportedVertical = createTableCellMergeLayout(
            createBlock([verticalMerge('first', 'a', 2)], {
                columns: ['a', 'b'],
                definitions: unsupportedDefinitions,
            }),
            RECORD_ORDER
        );
        const mixed = createTableCellMergeLayout(
            createBlock([horizontalMerge('first', 'a', 2)], {
                columns: ['a', 'b'],
                definitions: {
                    a: createDefinition('text', 'a'),
                    b: createDefinition('number', 'b'),
                },
            }),
            RECORD_ORDER
        );

        expect(unsupportedHorizontal.cells.size).toBe(0);
        expect(unsupportedVertical.cells.size).toBe(0);
        expect(unsupportedVertical.hasVerticalMerges).toBe(false);
        expect(mixed.cells.size).toBe(0);
    });
});

function horizontalMerge(record: string, column: string, colSpan: number) {
    return { anchor: { record, column }, rowSpan: 1, colSpan };
}

function verticalMerge(record: string, column: string, rowSpan: number) {
    return { anchor: { record, column }, rowSpan, colSpan: 1 };
}

describe('getMergedCellWidth', () => {
    it('adds fixed and automatic column widths in CSS', () => {
        expect(getMergedCellWidth(['120px', 'clamp(100px, calc(100% / 2), 100%)'])).toBe(
            'calc(120px + clamp(100px, calc(100% / 2), 100%))'
        );
    });
});
