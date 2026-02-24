import { describe, expect, it, mock } from 'bun:test';
import type { GitBookAnyContext } from '@/lib/context';
import type { JSONDocument } from '@gitbook/api';

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

describe('getDocumentSections', () => {
    it('extracts headings inside columns', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    type: 'columns',
                    data: {},
                    nodes: [
                        {
                            object: 'block',
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

        await expect(getDocumentSections(context, document)).resolves.toMatchObject([
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

    it('extracts headings inside tabs items', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    type: 'tabs',
                    data: {},
                    nodes: [
                        {
                            object: 'block',
                            type: 'tabs-item',
                            data: { title: 'Tab A' },
                            nodes: [
                                {
                                    object: 'block',
                                    type: 'heading-1',
                                    data: {},
                                    meta: { id: 'h1-in-tab' },
                                    nodes: [
                                        {
                                            object: 'text',
                                            leaves: [
                                                {
                                                    object: 'leaf',
                                                    text: 'Heading 1 in tab',
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

        await expect(getDocumentSections(context, document)).resolves.toMatchObject([
            {
                id: 'h1-in-tab',
                depth: 1,
                title: 'Heading 1 in tab',
            },
        ]);
    });
});
