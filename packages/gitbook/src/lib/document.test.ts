import { describe, expect, it } from 'bun:test';

import { getBlockTitle, isNodeEmpty } from './document';

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
            }),
        ).toEqual(true);
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
            }),
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
            }),
        ).toEqual('Title of expandable block');
    });
});
