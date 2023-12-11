import { it, expect } from 'bun:test';

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

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'plain',
                    content: 'console.log("Hello World")',
                },
            ],
        },
    ]);
});

it('should parse a multilines plain code', async () => {
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

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'plain',
                    content: 'if (value === true) {',
                },
            ],
        },
        {
            highlighted: false,
            tokens: [
                {
                    type: 'plain',
                    content: '  console.log("Hello World")',
                },
            ],
        },
        {
            highlighted: false,
            tokens: [
                {
                    type: 'plain',
                    content: '}',
                },
            ],
        },
    ]);
});

it('should parse code with an inline on a single line', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        data: {
            syntax: 'javascript',
        },
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

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'shiki',
                    token: {
                        content: 'console',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '.',
                    },
                },
                {
                    type: 'inline',
                    inline: {
                        type: 'annotation',
                    },
                    children: [
                        {
                            type: 'shiki',
                            token: {
                                content: 'log',
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: '(',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"Hello World"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ')',
                    },
                },
            ],
        },
    ]);
});

it('should parse code with an inline on a multiple line', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        data: {
            syntax: 'javascript',
        },
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: 'let ' }],
                    },
                    {
                        object: 'inline',
                        type: 'annotation',
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ object: 'leaf', marks: [], text: 'message' }],
                            },
                        ],
                        isVoid: false,
                        fragments: [],
                    },
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text: ';' }],
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

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'shiki',
                    token: {
                        content: 'let',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ' ',
                    },
                },
                {
                    type: 'inline',
                    inline: {
                        type: 'annotation',
                    },
                    children: [
                        {
                            type: 'shiki',
                            token: {
                                content: 'message',
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: ';',
                    },
                },
            ],
        },
        {
            highlighted: false,
            tokens: [
                {
                    type: 'shiki',
                    token: {
                        content: 'console',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '.',
                    },
                },
                {
                    type: 'inline',
                    inline: {
                        type: 'annotation',
                    },
                    children: [
                        {
                            type: 'shiki',
                            token: {
                                content: 'log',
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: '(',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"Hello World"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ')',
                    },
                },
            ],
        },
    ]);
});
