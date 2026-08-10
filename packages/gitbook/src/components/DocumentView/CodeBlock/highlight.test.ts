import { expect, it } from 'bun:test';
import type { DocumentBlockCode } from '@gitbook/api';

import {
    type HighlightLine,
    type HighlightToken,
    type RenderedInline,
    getInlines,
    highlight,
} from './highlight';

async function highlightWithInlines(block: DocumentBlockCode) {
    const inlines: RenderedInline[] = getInlines(block).map((inline) => ({
        inline,
        body: null,
    }));
    const result = await highlight(block, inlines);
    return result.lines;
}

it('should parse plain code', async () => {
    const tokens = await highlightWithInlines({
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
        ['shell', 'scss', 'scss', 'css', 'scss', 'yaml'].map(async (syntax) =>
            highlight(
                {
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
                },
                []
            )
        )
    );
});

it('should parse a multilines plain code', async () => {
    const tokens = await highlightWithInlines({
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
    const tokens = await highlightWithInlines({
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
                    type: 'annotation',
                    body: null,
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
                        content: '"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'Hello World',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"',
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
    const tokens = await highlightWithInlines({
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
                    type: 'annotation',
                    body: null,
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
                    type: 'annotation',
                    body: null,
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
                        content: '"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'Hello World',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"',
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
    const tokens = await highlightWithInlines({
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
                    type: 'annotation',
                    body: null,
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
    const tokens = await highlightWithInlines({
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
                    type: 'annotation',
                    body: null,
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
                                content: '.',
                            },
                        },
                        {
                            type: 'shiki',
                            token: {
                                content: 'world',
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
                        content: ')',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: ';',
                    },
                },
            ],
        },
    ]);
});

function joinLineContent(line: HighlightLine): string {
    const visit = (tokens: HighlightToken[]): string =>
        tokens
            .map((t) => {
                if (t.type === 'plain') return t.content;
                if (t.type === 'shiki') return t.token.content;
                return visit(t.children);
            })
            .join('');
    return visit(line.tokens);
}

function singleLineBlock(syntax: string | undefined, text: string): DocumentBlockCode {
    return {
        object: 'block',
        type: 'code',
        data: syntax ? { syntax } : {},
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                data: {},
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ object: 'leaf', marks: [], text }],
                    },
                ],
            },
        ],
    };
}

it('classifies and strips trailing // [!code ++] in JS', async () => {
    const lines = await highlightWithInlines(
        singleLineBlock('javascript', 'const a = 1 // [!code ++]')
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]!.diff).toBe('added');
    expect(joinLineContent(lines[0]!)).toBe('const a = 1');
});

it('classifies and strips trailing # [!code --] in Python', async () => {
    const lines = await highlightWithInlines(singleLineBlock('python', 'x = 1 # [!code --]'));
    expect(lines[0]!.diff).toBe('deleted');
    expect(joinLineContent(lines[0]!)).toBe('x = 1');
});

it('classifies and strips <!-- [!code ++] --> in HTML', async () => {
    const lines = await highlightWithInlines(
        singleLineBlock('html', '<div></div> <!-- [!code ++] -->')
    );
    expect(lines[0]!.diff).toBe('added');
    expect(joinLineContent(lines[0]!)).toBe('<div></div>');
});

it('classifies and strips /* [!code --] */ in CSS', async () => {
    const lines = await highlightWithInlines(
        singleLineBlock('css', '.a { color: red; } /* [!code --] */')
    );
    expect(lines[0]!.diff).toBe('deleted');
    expect(joinLineContent(lines[0]!)).toBe('.a { color: red; }');
});

it('does not classify when marker is not at end of line', async () => {
    const lines = await highlightWithInlines(
        singleLineBlock('javascript', 'const x = 1 // [!code ++] trailing')
    );
    expect(lines[0]!.diff).toBeNull();
    expect(joinLineContent(lines[0]!)).toBe('const x = 1 // [!code ++] trailing');
});

it('returns diff: null for lines without a marker', async () => {
    const lines = await highlightWithInlines(singleLineBlock('javascript', 'console.log("hi")'));
    expect(lines[0]!.diff).toBeNull();
});

it('classifies and strips marker via plainHighlighting fallback', async () => {
    const lines = await highlightWithInlines(
        singleLineBlock(undefined, 'plain text // [!code ++]')
    );
    expect(lines[0]!.diff).toBe('added');
    expect(joinLineContent(lines[0]!)).toBe('plain text');
});

it('preserves inline annotation when marker is stripped', async () => {
    const tokens = await highlightWithInlines({
        object: 'block',
        type: 'code',
        data: { syntax: 'javascript' },
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
                        leaves: [{ object: 'leaf', marks: [], text: '("Hi") // [!code ++]' }],
                    },
                ],
            },
        ],
    });

    expect(tokens[0]!.diff).toBe('added');
    expect(joinLineContent(tokens[0]!)).toBe('console.log("Hi")');
    // inline annotation around "log" must be preserved
    const hasAnnotation = tokens[0]!.tokens.some(
        (t) =>
            t.type === 'annotation' &&
            t.children.some((c) => c.type === 'shiki' && c.token.content === 'log')
    );
    expect(hasAnnotation).toBe(true);
});

it('should handle \\r', async () => {
    const tokens = await highlightWithInlines({
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
                        content: '.',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'log',
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
                        content: '"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'Hello',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"',
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
                        content: '.',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'log',
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
                        content: '"',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: 'World',
                    },
                },
                {
                    type: 'shiki',
                    token: {
                        content: '"',
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
