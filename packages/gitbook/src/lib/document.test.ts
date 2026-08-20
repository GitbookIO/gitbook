import { describe, expect, it } from 'bun:test';

import type { DocumentBlockParagraph } from '@gitbook/api';

import { getBlockTitle, isNodeEmpty } from './document';

const emptyParagraph: DocumentBlockParagraph = {
    object: 'block',
    type: 'paragraph',
    nodes: [{ object: 'text', leaves: [{ object: 'leaf', text: '', marks: [] }] }],
};

describe('isNodeEmpty', () => {
    it('should return true for a document with an empty paragraph', () => {
        expect(
            isNodeEmpty({
                object: 'document',
                data: {},
                nodes: [
                    {
                        object: 'block',
                        type: 'paragraph',
                        nodes: [
                            {
                                object: 'text',
                                leaves: [
                                    {
                                        object: 'leaf',
                                        text: '',
                                        marks: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
        ).toEqual(true);
    });

    it('should return true for a document with several empty paragraphs', () => {
        expect(
            isNodeEmpty({
                object: 'document',
                data: {},
                nodes: [emptyParagraph, emptyParagraph],
            })
        ).toEqual(true);
    });

    it('should return false for a paragraph whose children are not all blank', () => {
        expect(
            isNodeEmpty({
                object: 'block',
                type: 'paragraph',
                nodes: [
                    { object: 'text', leaves: [{ object: 'leaf', text: '', marks: [] }] },
                    { object: 'text', leaves: [{ object: 'leaf', text: 'Hello', marks: [] }] },
                ],
            })
        ).toEqual(false);
    });

    it('should return true for a document with only an if block', () => {
        expect(
            isNodeEmpty({
                object: 'document',
                data: {},
                nodes: [
                    {
                        object: 'block',
                        type: 'if',
                        data: { expression: 'visitor.claims.enabled' },
                        nodes: [
                            {
                                object: 'block',
                                type: 'paragraph',
                                nodes: [
                                    {
                                        object: 'text',
                                        leaves: [{ object: 'leaf', text: 'Hidden', marks: [] }],
                                    },
                                ],
                            },
                        ],
                    },
                    emptyParagraph,
                ],
            })
        ).toEqual(true);
    });

    it('should return false for a document with a tabs block whose panes are blank', () => {
        expect(
            isNodeEmpty({
                object: 'document',
                data: {},
                nodes: [
                    {
                        object: 'block',
                        type: 'tabs',
                        nodes: [
                            {
                                object: 'block',
                                type: 'tabs-item',
                                data: { title: 'Shown in the tab bar' },
                                nodes: [emptyParagraph],
                            },
                        ],
                        data: {},
                    },
                ],
            })
        ).toEqual(false);
    });

    it('should return false for a document with an api block', () => {
        expect(
            isNodeEmpty({
                object: 'document',
                data: {},
                nodes: [
                    {
                        object: 'block',
                        type: 'swagger',
                        isVoid: true,
                        data: {
                            ref: {
                                kind: 'file',
                                file: 'a',
                            },
                            method: 'get',
                            path: '/pet',
                        },
                    },
                ],
            })
        ).toEqual(false);
    });
});

describe('#getBlockTitle', () => {
    it('should return the title of an expandable block', () => {
        expect(
            getBlockTitle({
                object: 'block',
                type: 'expandable',
                isVoid: true,
                data: {},
                key: 'OX8znB9VmbgK',
                fragments: [
                    {
                        object: 'fragment',
                        nodes: [
                            {
                                object: 'block',
                                type: 'paragraph',
                                isVoid: false,
                                data: {},
                                nodes: [
                                    {
                                        object: 'text',
                                        leaves: [
                                            {
                                                object: 'leaf',
                                                text: 'Title of expandable block',
                                                marks: [],
                                            },
                                        ],
                                        key: '7sZdCBHTw6Si',
                                    },
                                ],
                                key: 'msYtjdwNmiAB',
                            },
                        ],
                        key: 'cNhmBygbrP8N',
                        fragment: 'expandable-title',
                        type: 'expandable-title',
                    },
                    {
                        object: 'fragment',
                        nodes: [
                            {
                                object: 'block',
                                type: 'paragraph',
                                isVoid: false,
                                data: {},
                                nodes: [
                                    {
                                        object: 'text',
                                        leaves: [
                                            {
                                                object: 'leaf',
                                                text: 'And content of the expandable',
                                                marks: [],
                                            },
                                        ],
                                        key: '0GEghVKyWRBt',
                                    },
                                ],
                                key: '9iEwdHdZ5y0S',
                            },
                        ],
                        key: 'newg71i9Ujjl',
                        fragment: 'expandable-body',
                        type: 'expandable-body',
                    },
                ],
                meta: { id: 'expandable-block' },
            })
        ).toEqual('Title of expandable block');
    });
});
