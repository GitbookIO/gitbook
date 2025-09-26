import { describe, expect, it } from 'bun:test';
import { convertCodeStringToBlock } from './utils';

describe('convertCodeStringToBlock', () => {
    it('converts plain code string without placeholders', () => {
        const result = convertCodeStringToBlock({
            key: 'test1',
            code: 'console.log("hello");',
            syntax: 'javascript',
        });

        expect(result).toEqual({
            key: 'test1',
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
                            leaves: [{ object: 'leaf', text: 'console.log("hello");', marks: [] }],
                        },
                    ],
                },
            ],
        });
    });

    it('converts a single placeholder into an expression node', () => {
        const result = convertCodeStringToBlock({
            key: 'test2',
            code: 'const config = { API_KEY: "$$__X-GITBOOK-PREFILL[visitor.claims.apiKey ?? "YOUR_API_KEY"]__$$" }',
            syntax: 'javascript',
        });

        expect(result).toEqual({
            key: 'test2',
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
                            leaves: [
                                { object: 'leaf', text: 'const config = { API_KEY: "', marks: [] },
                            ],
                        },
                        {
                            object: 'inline',
                            type: 'expression',
                            data: { expression: 'visitor.claims.apiKey ?? "YOUR_API_KEY"' },
                            isVoid: true,
                        },
                        {
                            object: 'text',
                            leaves: [{ object: 'leaf', text: '" }', marks: [] }],
                        },
                    ],
                },
            ],
        });
    });

    it('handles multiple placeholders in one line', () => {
        const result = convertCodeStringToBlock({
            key: 'test3',
            code: 'let a = $$__X-GITBOOK-PREFILL[valA]__$$, b = $$__X-GITBOOK-PREFILL[valB]__$$;',
            syntax: 'javascript',
        });

        expect(result).toEqual({
            key: 'test3',
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
                            leaves: [{ object: 'leaf', text: 'let a = ', marks: [] }],
                        },
                        {
                            object: 'inline',
                            type: 'expression',
                            data: { expression: 'valA' },
                            isVoid: true,
                        },
                        {
                            object: 'text',
                            leaves: [{ object: 'leaf', text: ', b = ', marks: [] }],
                        },
                        {
                            object: 'inline',
                            type: 'expression',
                            data: { expression: 'valB' },
                            isVoid: true,
                        },
                        {
                            object: 'text',
                            leaves: [{ object: 'leaf', text: ';', marks: [] }],
                        },
                    ],
                },
            ],
        });
    });

    it('handles multiple placeholders across different lines', () => {
        const result = convertCodeStringToBlock({
            key: 'test4',
            code: [
                'const name = "$$__X-GITBOOK-PREFILL[visitor.claims.userName]__$$";',
                'const age = $$__X-GITBOOK-PREFILL[visitor.claims.userAge]__$$;',
                'console.log(name, age);',
            ].join('\n'),
            syntax: 'javascript',
        });

        expect(result).toEqual({
            key: 'test4',
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
                            leaves: [{ object: 'leaf', text: 'const name = "', marks: [] }],
                        },
                        {
                            object: 'inline',
                            type: 'expression',
                            data: { expression: 'visitor.claims.userName' },
                            isVoid: true,
                        },
                        {
                            object: 'text',
                            leaves: [{ object: 'leaf', text: '";', marks: [] }],
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
                            leaves: [{ object: 'leaf', text: 'const age = ', marks: [] }],
                        },
                        {
                            object: 'inline',
                            type: 'expression',
                            data: { expression: 'visitor.claims.userAge' },
                            isVoid: true,
                        },
                        {
                            object: 'text',
                            leaves: [{ object: 'leaf', text: ';', marks: [] }],
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
                                { object: 'leaf', text: 'console.log(name, age);', marks: [] },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('returns an empty code block for empty string', () => {
        const result = convertCodeStringToBlock({
            key: 'test5',
            code: '',
            syntax: 'javascript',
        });

        expect(result).toEqual({
            key: 'test5',
            object: 'block',
            type: 'code',
            data: { syntax: 'javascript' },
            nodes: [
                {
                    object: 'block',
                    type: 'code-line',
                    data: {},
                    nodes: [],
                },
            ],
        });
    });
});
