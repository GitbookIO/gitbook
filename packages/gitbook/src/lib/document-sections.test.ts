import { describe, expect, it, mock } from 'bun:test';
import type { GitBookAnyContext } from '@/lib/context';
import type { JSONDocument } from '@gitbook/api';
import { type ReactNode, isValidElement } from 'react';

mock.module('./openapi/resolveOpenAPIOperationBlock', () => ({
    resolveOpenAPIOperationBlock: async () => ({ data: null }),
}));

mock.module('./openapi/resolveOpenAPISchemasBlock', () => ({
    resolveOpenAPISchemasBlock: async () => ({ data: null }),
}));

const { getDocumentSections } = await import('./document-sections');

const context = {
    dataFetcher: {
        withToken: () => {
            throw new Error('not used in this test');
        },
    },
} as unknown as GitBookAnyContext;

function reactNodeToText(node: ReactNode): string {
    if (node == null || typeof node === 'boolean') {
        return '';
    }

    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map((child) => reactNodeToText(child)).join('');
    }

    if (isValidElement<{ children?: ReactNode }>(node)) {
        return reactNodeToText(node.props.children);
    }

    return '';
}

describe('getDocumentSections', () => {
    it('extracts headings inside columns', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    // @ts-expect-error columns is missing from top-level blocks, fixed in the next API update
                    type: 'columns',
                    data: {},
                    isVoid: false,
                    nodes: [
                        {
                            object: 'block',
                            // @ts-expect-error columns is missing from top-level blocks, fixed in the next API update
                            type: 'column',
                            data: {},
                            nodes: [
                                {
                                    object: 'block',
                                    type: 'heading-1',
                                    data: {},
                                    meta: { id: 'h1-in-column' },
                                    nodes: [
                                        {
                                            object: 'text',
                                            leaves: [
                                                {
                                                    object: 'leaf',
                                                    text: 'Heading 1 in column',
                                                    marks: [],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    object: 'block',
                                    type: 'heading-2',
                                    data: {},
                                    meta: { id: 'h2-in-column' },
                                    nodes: [
                                        {
                                            object: 'text',
                                            leaves: [
                                                {
                                                    object: 'leaf',
                                                    text: 'Heading 2 in column',
                                                    marks: [],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const sections = await getDocumentSections(context, document);

        expect(
            sections.map((section) => ({
                id: section.id,
                depth: section.depth,
                title: reactNodeToText(section.title),
            }))
        ).toEqual([
            {
                id: 'h1-in-column',
                depth: 1,
                title: 'Heading 1 in column',
            },
            {
                id: 'h2-in-column',
                depth: 2,
                title: 'Heading 2 in column',
            },
        ]);
    });
});
