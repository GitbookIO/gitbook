import { describe, expect, it } from 'bun:test';

import type {
    DocumentBlock,
    DocumentBlockParagraph,
    DocumentTableDefinition,
    DocumentTableRecord,
} from '@gitbook/api';

import { isRecordColumnEmpty } from './isRecordColumnEmpty';

type Value = DocumentTableRecord['values'][string];

/**
 * Check a single-column table holding `value`, with `fragmentNodes` as the column's text fragment.
 */
function isEmpty(
    definition: DocumentTableDefinition,
    value: Value,
    fragmentNodes?: DocumentBlock[],
    column = 'column'
): boolean {
    return isRecordColumnEmpty(
        {
            object: 'block',
            type: 'table',
            isVoid: true,
            data: {
                view: { type: 'cards', cardSize: 'medium', columns: ['column'] },
                records: {},
                definition: { column: definition },
            },
            fragments: fragmentNodes
                ? [{ object: 'fragment', fragment: 'fragment', nodes: fragmentNodes }]
                : [],
        },
        { orderIndex: 'a', values: { column: value } },
        column
    );
}

function paragraph(text: string): DocumentBlockParagraph {
    return {
        object: 'block',
        type: 'paragraph',
        nodes: [{ object: 'text', leaves: [{ object: 'leaf', text, marks: [] }] }],
    };
}

const ifBlock: DocumentBlock = {
    object: 'block',
    type: 'if',
    data: { expression: 'visitor.claims.enabled' },
    nodes: [paragraph('Hidden')],
};

const TEXT: DocumentTableDefinition = {
    id: 'column',
    title: 'Text',
    type: 'text',
    textAlignment: 'left',
};

describe('isRecordColumnEmpty', () => {
    describe('text', () => {
        it('keeps a fragment with content', () => {
            expect(isEmpty(TEXT, 'fragment', [paragraph('Hello')])).toBe(false);
        });

        it('drops a fragment with no nodes', () => {
            expect(isEmpty(TEXT, 'fragment', [])).toBe(true);
        });

        it('drops a missing fragment', () => {
            expect(isEmpty(TEXT, 'fragment')).toBe(true);
        });

        it('drops blank paragraphs, if blocks, and a mix of the two', () => {
            expect(isEmpty(TEXT, 'fragment', [paragraph(''), paragraph('  ')])).toBe(true);
            expect(isEmpty(TEXT, 'fragment', [ifBlock])).toBe(true);
            expect(isEmpty(TEXT, 'fragment', [ifBlock, paragraph('')])).toBe(true);
        });

        it('keeps a fragment whose blocks paint something of their own', () => {
            expect(
                isEmpty(TEXT, 'fragment', [
                    paragraph(''),
                    { object: 'block', type: 'divider', isVoid: true, data: {} },
                ])
            ).toBe(false);
            // A hint renders its coloured box however blank its content is.
            expect(
                isEmpty(TEXT, 'fragment', [
                    {
                        object: 'block',
                        type: 'hint',
                        data: { style: 'info' },
                        nodes: [paragraph('')],
                    },
                ])
            ).toBe(false);
        });
    });

    describe('other column types', () => {
        it('keeps an unchecked checkbox, drops a missing one', () => {
            const checkbox: DocumentTableDefinition = { id: 'column', title: '', type: 'checkbox' };
            expect(isEmpty(checkbox, false)).toBe(false);
            expect(isEmpty(checkbox, null)).toBe(true);
        });

        it('keeps a zero number, drops an unrated rating', () => {
            const rating: DocumentTableDefinition = {
                id: 'column',
                title: '',
                type: 'rating',
                max: 5,
            };
            expect(isEmpty({ id: 'column', title: '', type: 'number' }, 0)).toBe(false);
            expect(isEmpty(rating, 3)).toBe(false);
            expect(isEmpty(rating, 0)).toBe(true);
        });

        it('drops a select with no matching option', () => {
            const select: DocumentTableDefinition = {
                id: 'column',
                title: '',
                type: 'select',
                multiple: true,
                options: [{ value: 'a', label: 'A', color: 'blue' }],
            };
            expect(isEmpty(select, ['a'])).toBe(false);
            expect(isEmpty(select, ['b'])).toBe(true);
            expect(isEmpty(select, [])).toBe(true);
        });

        it('drops empty file and user lists', () => {
            const files: DocumentTableDefinition = { id: 'column', title: '', type: 'files' };
            const users: DocumentTableDefinition = {
                id: 'column',
                title: '',
                type: 'users',
                multiple: true,
            };
            expect(isEmpty(files, ['file-1'])).toBe(false);
            expect(isEmpty(files, [])).toBe(true);
            expect(isEmpty(users, ['user-1'])).toBe(false);
            expect(isEmpty(users, [])).toBe(true);
        });

        it('drops a missing content ref and image', () => {
            const ref: DocumentTableDefinition = { id: 'column', title: '', type: 'content-ref' };
            const image: DocumentTableDefinition = { id: 'column', title: '', type: 'image' };
            expect(isEmpty(ref, { kind: 'url', url: 'https://a.co' })).toBe(false);
            expect(isEmpty(ref, null)).toBe(true);
            expect(isEmpty(image, { ref: { kind: 'file', file: 'file-1' } })).toBe(false);
            expect(isEmpty(image, null)).toBe(true);
        });
    });

    it('drops a column without a definition', () => {
        expect(isEmpty(TEXT, 'fragment', [paragraph('Hello')], 'unknown')).toBe(true);
    });
});
