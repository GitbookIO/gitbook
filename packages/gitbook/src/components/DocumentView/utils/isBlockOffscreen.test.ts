import { expect, it } from 'bun:test';

import type { DocumentBlockParagraph, DocumentBlockTable, JSONDocument } from '@gitbook/api';

import { isBlockOffscreen } from './isBlockOffscreen';

it('should return true if block is offscreen', () => {
    const p1: DocumentBlockParagraph = {
        object: 'block',
        type: 'paragraph',
        nodes: [],
    };

    const p2: DocumentBlockParagraph = {
        object: 'block',
        type: 'paragraph',
        nodes: [],
    };

    const document: JSONDocument = {
        object: 'document',
        nodes: [p1, p2],
        data: {},
    };

    expect(
        isBlockOffscreen({
            document,
            block: p2,
            ancestorBlocks: [],
        })
    ).toBe(false);

    expect(
        isBlockOffscreen(
            {
                document,
                block: p2,
                ancestorBlocks: [],
            },
            5
        )
    ).toBe(true);
});

it('should treat content in table cells as offscreen', () => {
    const cell: DocumentBlockParagraph = {
        object: 'block',
        type: 'paragraph',
        nodes: [],
    };

    const table: DocumentBlockTable = {
        object: 'block',
        type: 'table',
        isVoid: true,
        data: {
            view: { type: 'cards', cardSize: 'medium', columns: ['column'] },
            records: {},
            definition: {},
        },
        fragments: [{ object: 'fragment', fragment: 'cell', nodes: [cell] }],
    };

    const document: JSONDocument = {
        object: 'document',
        nodes: [table],
        data: {},
    };

    expect(isBlockOffscreen({ document, block: cell, ancestorBlocks: [table] })).toBe(true);
});
