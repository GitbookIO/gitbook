import { describe, expect, it } from 'bun:test';

import { isNodeEmpty } from './document';

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
