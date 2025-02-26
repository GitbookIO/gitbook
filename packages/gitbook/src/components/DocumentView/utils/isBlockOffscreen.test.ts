import { DocumentBlockParagraph, JSONDocument } from '@gitbook/api';
import { it, expect } from 'bun:test';

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
        }),
    ).toBe(false);

    expect(
        isBlockOffscreen(
            {
                document,
                block: p2,
                ancestorBlocks: [],
            },
            5,
        ),
    ).toBe(true);
});
