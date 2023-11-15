import { it } from 'bun:test';

import { highlight } from './highlight';

it('should parse plain code', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        data: {},
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: 'console.log("Hello World")' }],
                    },
                ],
            },
        ],
    });
});

it.only('should parse a multilines plain code', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        data: {},
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: 'if (value === true) {' }],
                    },
                ],
            },
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [
                            { object: 'leaf', marks: [], text: '  console.log("Hello World")' },
                        ],
                    },
                ],
            },
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: '}' }],
                    },
                ],
            },
        ],
    });
});

it('should parse code with an inline', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        data: {},
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: 'console.' }],
                    },
                    {
                        object: 'inline',
                        type: 'annotation',
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ object: 'leaf', marks: [], text: 'log' }],
                            },
                        ],
                        isVoid: false,
                        fragments: [],
                    },
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: '("Hello World")' }],
                    },
                ],
            },
        ],
    });
});
