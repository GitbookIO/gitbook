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

it('should parse different code in parallel', async () => {
    await Promise.all(
        ['shell', 'scss', 'markdown', 'less', 'scss', 'css', 'scss', 'yaml'].map(async (syntax) =>
            highlight({
                object: 'block',
                type: 'code',
                data: {
                    syntax: syntax,
                },
                nodes: [
                    {
                        object: 'block',
                        type: 'code-line',
                        data: {},
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ object: 'leaf', marks: [], text: 'Hello world' }],
                            },
                        ],
                    },
                ],
            }),
        ),
    );
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
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ' ',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'a',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ' ',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '=',
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
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: '.world',
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: '(',
                            },
                        },
                    ],
                },
                {
                    type: 'shiki',
                    token: {
                        content: ');',
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
