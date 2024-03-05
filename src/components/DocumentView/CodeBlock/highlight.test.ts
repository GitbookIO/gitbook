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

it('should support code token finishing before the end of the annotation', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        isVoid: false,
        data: { syntax: 'bash' },
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                isVoid: false,
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', text: '                ', marks: [] }],
                        key: 'k1',
                    },
                    {
                        object: 'inline',
                        type: 'annotation',
                        isVoid: false,
                        data: {},
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ object: 'leaf', text: 'sh ', marks: [] }],
                                key: 'k2',
                            },
                        ],
                        key: 'k3',
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
                                                        text: '',
                                                        marks: [],
                                                    },
                                                ],
                                                key: 'k4',
                                            },
                                        ],
                                        key: 'k5',
                                    },
                                ],
                                key: 'k6',
                                fragment: 'annotation-body',
                                type: 'annotation-body',
                            },
                        ],
                    },
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', text: "'''", marks: [] }],
                        key: 'k7',
                    },
                ],
                key: 'k8',
            },
        ],
        key: 'k9',
    });

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'shiki',
                    token: {
                        content: '                ',
                        start: 0,
                        end: 16,
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
                                content: 'sh',
                                start: 16,
                                end: 18,
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: ' ',
                                start: 18,
                                end: 19,
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: "'''",
                        start: 19,
                        end: 22,
                    },
                },
            ],
        },
    ]);
});

it('should support multiple code tokens in an annotation', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        isVoid: false,
        data: { syntax: 'javascript' },
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                isVoid: false,
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', text: 'const a =', marks: [] }],
                        key: 'k1',
                    },
                    {
                        object: 'inline',
                        type: 'annotation',
                        isVoid: false,
                        data: {},
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ object: 'leaf', text: 'hello.world(', marks: [] }],
                                key: 'k2',
                            },
                        ],
                        key: 'k3',
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
                                                        text: 'Inner content',
                                                        marks: [],
                                                    },
                                                ],
                                                key: 'k4',
                                            },
                                        ],
                                        key: 'k5',
                                    },
                                ],
                                key: 'k6',
                                fragment: 'annotation-body',
                                type: 'annotation-body',
                            },
                        ],
                    },
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', text: ');', marks: [] }],
                        key: 'k7',
                    },
                ],
                key: 'k8',
            },
        ],
        key: 'k9',
    });

    expect(tokens).toMatchObject([
        {
            highlighted: false,
            tokens: [
                {
                    type: 'shiki',
                    token: {
                        content: 'const',
                        color: '#000007',
                        start: 0,
                        end: 5,
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ' ',
                        color: '#000001',
                        start: 5,
                        end: 6,
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'a',
                        color: '#000004',
                        start: 6,
                        end: 7,
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ' ',
                        color: '#000001',
                        start: 7,
                        end: 8,
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '=',
                        color: '#000007',
                        start: 8,
                        end: 9,
                    },
                },
                {
                    type: 'inline',
                    inline: {
                        object: 'inline',
                        type: 'annotation',
                    },
                    children: [
                        {
                            type: 'shiki',
                            token: {
                                content: 'hello',
                                color: '#000004',
                                start: 9,
                                end: 14,
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: '.world',
                                color: '#000009',
                                start: 14,
                                end: 20,
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: '(',
                                color: '#000001',
                                start: 20,
                                end: 21,
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: ');',
                        color: '#000001',
                        start: 21,
                        end: 23,
                    },
                },
            ],
        },
    ]);
});

it('should handle \\r', async () => {
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
                        leaves: [{ object: 'leaf', marks: [], text: 'console.log("Hello")' }],
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
                        leaves: [{ object: 'leaf', marks: [], text: '\rconsole.log("World")' }],
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
                        content: '.log',
                    },
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
                        content: '"Hello"',
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
                        content: '.log',
                    },
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
                        content: '"World"',
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
