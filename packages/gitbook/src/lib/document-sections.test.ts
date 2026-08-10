import { describe, expect, it, mock } from 'bun:test';
import type { GitBookAnyContext } from '@/lib/context';
import type { JSONDocument } from '@gitbook/api';
import { type ReactNode, isValidElement } from 'react';

mock.module('./openapi/resolveOpenAPIOperationBlock', () => ({
    resolveOpenAPIOperationBlock: async () => ({ data: null }),
}));

mock.module('./openapi/resolveOpenAPISchemasBlock', () => ({
    resolveOpenAPISchemasBlock: async ({ block }: { block: { data: { schemas?: string[] } } }) => ({
        data: {
            schemas: (block.data.schemas ?? []).map((name) => ({ name, schema: {} })),
        },
    }),
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
                    type: 'columns',
                    data: {},
                    isVoid: false,
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

    it('extracts headings inside updates blocks', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    type: 'updates',
                    data: { format: 'full' },
                    isVoid: false,
                    nodes: [
                        {
                            object: 'block',
                            type: 'update',
                            data: {
                                date: '2026-04-08',
                                tags: [{ kind: 'tag', tag: 'improvements' }],
                            },
                            isVoid: false,
                            nodes: [
                                {
                                    object: 'block',
                                    type: 'heading-1',
                                    data: {},
                                    meta: { id: 'h1-in-update' },
                                    nodes: [
                                        {
                                            object: 'text',
                                            leaves: [
                                                {
                                                    object: 'leaf',
                                                    text: 'Heading 1 in update',
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
                                    meta: { id: 'h2-in-update' },
                                    nodes: [
                                        {
                                            object: 'text',
                                            leaves: [
                                                {
                                                    object: 'leaf',
                                                    text: 'Heading 2 in update',
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

        const sections = await getDocumentSections(
            {
                ...context,
                revision: {
                    tags: [
                        {
                            slug: 'improvements',
                            label: 'Improvements',
                            color: 'default',
                            icon: undefined,
                        },
                    ],
                },
            } as unknown as GitBookAnyContext,
            document
        );

        expect(
            sections.map((section) => ({
                id: section.id,
                depth: section.depth,
                title: reactNodeToText(section.title),
                tags: section.tags,
            }))
        ).toEqual([
            {
                id: 'h1-in-update',
                depth: 1,
                title: 'Heading 1 in update',
                tags: ['improvements'],
            },
            {
                id: 'h2-in-update',
                depth: 2,
                title: 'Heading 2 in update',
                tags: ['improvements'],
            },
        ]);
    });

    it('extracts a single-schema openapi-schemas block as one section', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    type: 'openapi-schemas',
                    data: { schemas: ['User'], grouped: false },
                    meta: { id: 'models-block' },
                    isVoid: false,
                    nodes: [],
                } as unknown as JSONDocument['nodes'][number],
            ],
        };

        const sections = await getDocumentSections(context, document);

        expect(
            sections.map((section) => ({
                id: section.id,
                depth: section.depth,
                title: reactNodeToText(section.title),
            }))
        ).toEqual([{ id: 'models-block', depth: 1, title: 'The User object' }]);
    });

    it('extracts one section per model for grouped/multi-schema openapi-schemas blocks', async () => {
        const document: JSONDocument = {
            object: 'document',
            data: { schemaVersion: 2 },
            nodes: [
                {
                    object: 'block',
                    type: 'openapi-schemas',
                    data: { schemas: ['User', 'Pet Store'], grouped: true },
                    meta: { id: 'models-block' },
                    isVoid: false,
                    nodes: [],
                } as unknown as JSONDocument['nodes'][number],
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
            { id: 'user', depth: 1, title: 'User' },
            { id: 'pet-store', depth: 1, title: 'Pet Store' },
        ]);
    });
});
