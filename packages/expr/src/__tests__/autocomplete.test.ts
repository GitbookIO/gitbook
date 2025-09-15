import { describe, expect, it } from 'bun:test';

import { ExpressionRuntime } from '../runtime';
import {
    SymbolArray,
    SymbolBoolean,
    SymbolNumber,
    SymbolObject,
    SymbolString,
    SymbolType,
    SymbolsTable,
} from '../symbols';
import {
    type AutocompleteSuggestions,
    type AutocompleteSymbolSuggestion,
    SUPPORTED_BINARY_OPERATORS,
    SUPPORTED_CONDITIONAL_OPERATORS,
    SUPPORTED_LOGICAL_OPERATORS,
} from '../types';

describe('autocomplete', () => {
    const runtime = new ExpressionRuntime();
    const visitorClaimsHelloArraySymbol = SymbolArray({
        name: 'hello',
        description: 'An array of string',
        items: SymbolString(),
    });
    const symbols = {
        visitor: SymbolObject({
            name: 'visitor',
            properties: {
                claims: SymbolObject({
                    name: 'claims',
                    description: 'The claims contained in the visitor JWT token',
                    properties: {
                        key: SymbolString({ name: 'key' }),
                        flags: SymbolObject({
                            name: 'flags',
                            properties: {
                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                            },
                            methods: [],
                        }),
                        hello: visitorClaimsHelloArraySymbol,
                        role: SymbolString({
                            name: 'role',
                            enum: ['admin', 'editor', 'reader'],
                        }),
                    },
                    methods: [],
                }),
            },
            methods: [],
        }),
    };
    const context = new SymbolsTable(symbols);
    const SCENARIOS: Array<{
        expressionWithCursor: string;
        expectedSuggestions: AutocompleteSuggestions;
    }> = [
        {
            expressionWithCursor: 'visit<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'visitor',
                            properties: {
                                claims: SymbolObject({
                                    name: 'claims',
                                    description: 'The claims contained in the visitor JWT token',
                                    properties: {
                                        key: SymbolString({ name: 'key' }),
                                        flags: SymbolObject({
                                            name: 'flags',
                                            properties: {
                                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                                            },
                                            methods: [],
                                        }),
                                        hello: SymbolArray({
                                            name: 'hello',
                                            description: 'An array of string',
                                            items: SymbolString(),
                                        }),
                                        role: SymbolString({
                                            name: 'role',
                                            enum: ['admin', 'editor', 'reader'],
                                        }),
                                    },
                                    methods: [],
                                }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor',
                        parentRef: undefined,
                        childrenRefs: ['visitor.claims'],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'claims',
                            description: 'The claims contained in the visitor JWT token',
                            properties: {
                                key: SymbolString({ name: 'key' }),
                                flags: SymbolObject({
                                    name: 'flags',
                                    properties: {
                                        FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                        FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                        FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                        FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                                    },
                                    methods: [],
                                }),
                                hello: SymbolArray({
                                    name: 'hello',
                                    description: 'An array of string',
                                    items: SymbolString(),
                                }),
                                role: SymbolString({
                                    name: 'role',
                                    enum: ['admin', 'editor', 'reader'],
                                }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor.claims',
                        parentRef: 'visitor',
                        childrenRefs: [
                            'visitor.claims.key',
                            'visitor.claims.flags',
                            'visitor.claims.hello',
                            'visitor.claims.role',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolString({ name: 'key' }),
                        ref: 'visitor.claims.key',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.key.length',
                            'visitor.claims.key.at',
                            'visitor.claims.key.endsWith',
                            'visitor.claims.key.includes',
                        ],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'flags',
                            properties: {
                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor.claims.flags',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.flags.FLAG1',
                            'visitor.claims.flags.FLAG2',
                            'visitor.claims.flags.FLAG3',
                            'visitor.claims.flags.FLAG4',
                        ],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolArray({
                            name: 'hello',
                            description: 'An array of string',
                            items: SymbolString(),
                        }),
                        ref: 'visitor.claims.hello',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.hello.length',
                            'visitor.claims.hello.at',
                            'visitor.claims.hello.includes',
                            'visitor.claims.hello.some',
                            'visitor.claims.hello.every',
                        ],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolString({
                            name: 'role',
                            enum: ['admin', 'editor', 'reader'],
                        }),
                        ref: 'visitor.claims.role',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.role.length',
                            'visitor.claims.role.at',
                            'visitor.claims.role.endsWith',
                            'visitor.claims.role.includes',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.ke<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolString({ name: 'key' }),
                        ref: 'visitor.claims.key',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.key.length',
                            'visitor.claims.key.at',
                            'visitor.claims.key.endsWith',
                            'visitor.claims.key.includes',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.h<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolArray({
                            name: 'hello',
                            description: 'An array of string',
                            items: SymbolString(),
                        }),
                        ref: 'visitor.claims.hello',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.hello.length',
                            'visitor.claims.hello.at',
                            'visitor.claims.hello.includes',
                            'visitor.claims.hello.some',
                            'visitor.claims.hello.every',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.hello.<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolNumber({
                            name: 'length',
                            description: `The length data property of an Array instance represents the number of elements in that array.
                The value is an unsigned, 32-bit integer that is always numerically greater than the highest index in the array.`,
                            link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length',
                        }),
                        ref: 'visitor.claims.hello.length',
                        parentRef: 'visitor.claims.hello',
                        childrenRefs: [],
                    },
                },
                ...visitorClaimsHelloArraySymbol.methods.map<AutocompleteSymbolSuggestion>(
                    (method) => ({
                        type: 'symbol',
                        symbol: {
                            definition: method,
                            ref: `visitor.claims.hello.${method.name}`,
                            parentRef: 'visitor.claims.hello',
                            childrenRefs: [],
                        },
                    })
                ),
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.f<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'flags',
                            properties: {
                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor.claims.flags',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.flags.FLAG1',
                            'visitor.claims.flags.FLAG2',
                            'visitor.claims.flags.FLAG3',
                            'visitor.claims.flags.FLAG4',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.fl<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'flags',
                            properties: {
                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor.claims.flags',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.flags.FLAG1',
                            'visitor.claims.flags.FLAG2',
                            'visitor.claims.flags.FLAG3',
                            'visitor.claims.flags.FLAG4',
                        ],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG1' }),
                        ref: 'visitor.claims.flags.FLAG1',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG2' }),
                        ref: 'visitor.claims.flags.FLAG2',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG3' }),
                        ref: 'visitor.claims.flags.FLAG3',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG4' }),
                        ref: 'visitor.claims.flags.FLAG4',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FL<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG1' }),
                        ref: 'visitor.claims.flags.FLAG1',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG2' }),
                        ref: 'visitor.claims.flags.FLAG2',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG3' }),
                        ref: 'visitor.claims.flags.FLAG3',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolBoolean({ name: 'FLAG4' }),
                        ref: 'visitor.claims.flags.FLAG4',
                        parentRef: 'visitor.claims.flags',
                        childrenRefs: [],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.key <cur>',
            expectedSuggestions: [...SUPPORTED_BINARY_OPERATORS].map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 <cur>',
            expectedSuggestions: [
                ...[...SUPPORTED_BINARY_OPERATORS, ...SUPPORTED_LOGICAL_OPERATORS].filter((op) =>
                    ['==', '!=', '===', '!==', '&&', '||'].includes(op.operator)
                ),
                ...SUPPORTED_CONDITIONAL_OPERATORS,
            ].map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 =<cur>',
            expectedSuggestions: SUPPORTED_BINARY_OPERATORS.filter((op) =>
                ['==', '==='].includes(op.operator)
            ).map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 ==<cur>',
            expectedSuggestions: SUPPORTED_BINARY_OPERATORS.filter(
                (op) => op.operator === '==='
            ).map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 !<cur>',
            expectedSuggestions: SUPPORTED_BINARY_OPERATORS.filter((op) =>
                ['!=', '!=='].includes(op.operator)
            ).map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 !=<cur>',
            expectedSuggestions: SUPPORTED_BINARY_OPERATORS.filter(
                (op) => op.operator === '!=='
            ).map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == <cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: true },
                },
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: false },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == t<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: true },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == tr<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: true },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == true<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == f<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: false },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == fa<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.Boolean, data: false },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == non<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == false<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.role == <cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'admin' },
                },
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'editor' },
                },
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'reader' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == ad<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'admin' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == admin<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'admin' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == "ad<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'admin' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == "admin<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'admin' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == "admin"<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.role == edit<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'editor' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == "edit<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'editor' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == editor<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: { kind: 'direct', type: SymbolType.String, data: 'editor' },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.role == "editor"<cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.hello == <cur>',
            expectedSuggestions: [],
        },
        {
            expressionWithCursor: 'visitor.claims.hello[1] == <cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: {
                        kind: 'in-array',
                        srcSymbol: visitorClaimsHelloArraySymbol,
                        matchedLiteralString: '',
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.hello[1] == "test<cur>',
            expectedSuggestions: [
                {
                    type: 'literal-value',
                    value: {
                        kind: 'in-array',
                        srcSymbol: visitorClaimsHelloArraySymbol,
                        matchedLiteralString: '"test',
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 == true <cur>',
            expectedSuggestions: [
                ...SUPPORTED_LOGICAL_OPERATORS.filter((op) => ['&&', '||'].includes(op.operator)),
                ...SUPPORTED_CONDITIONAL_OPERATORS,
            ].map((op) => ({
                type: 'operator',
                ...op,
            })),
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 !== true && v<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'visitor',
                            properties: {
                                claims: SymbolObject({
                                    name: 'claims',
                                    description: 'The claims contained in the visitor JWT token',
                                    properties: {
                                        key: SymbolString({ name: 'key' }),
                                        flags: SymbolObject({
                                            name: 'flags',
                                            properties: {
                                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                                            },
                                            methods: [],
                                        }),
                                        hello: SymbolArray({
                                            name: 'hello',
                                            description: 'An array of string',
                                            items: SymbolString(),
                                        }),
                                        role: SymbolString({
                                            name: 'role',
                                            enum: ['admin', 'editor', 'reader'],
                                        }),
                                    },
                                    methods: [],
                                }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor',
                        parentRef: undefined,
                        childrenRefs: ['visitor.claims'],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 ? <cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'visitor',
                            properties: {
                                claims: SymbolObject({
                                    name: 'claims',
                                    description: 'The claims contained in the visitor JWT token',
                                    properties: {
                                        key: SymbolString({ name: 'key' }),
                                        flags: SymbolObject({
                                            name: 'flags',
                                            properties: {
                                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                                            },
                                            methods: [],
                                        }),
                                        hello: SymbolArray({
                                            name: 'hello',
                                            description: 'An array of string',
                                            items: SymbolString(),
                                        }),
                                        role: SymbolString({
                                            name: 'role',
                                            enum: ['admin', 'editor', 'reader'],
                                        }),
                                    },
                                    methods: [],
                                }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor',
                        parentRef: undefined,
                        childrenRefs: ['visitor.claims'],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 ? visit<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'visitor',
                            properties: {
                                claims: SymbolObject({
                                    name: 'claims',
                                    description: 'The claims contained in the visitor JWT token',
                                    properties: {
                                        key: SymbolString({ name: 'key' }),
                                        flags: SymbolObject({
                                            name: 'flags',
                                            properties: {
                                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                                            },
                                            methods: [],
                                        }),
                                        hello: SymbolArray({
                                            name: 'hello',
                                            description: 'An array of string',
                                            items: SymbolString(),
                                        }),
                                        role: SymbolString({
                                            name: 'role',
                                            enum: ['admin', 'editor', 'reader'],
                                        }),
                                    },
                                    methods: [],
                                }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor',
                        parentRef: undefined,
                        childrenRefs: ['visitor.claims'],
                    },
                },
            ],
        },
        {
            expressionWithCursor: 'visitor.claims.flags.FLAG1 ? visitor.claims.fl<cur>',
            expectedSuggestions: [
                {
                    type: 'symbol',
                    symbol: {
                        definition: SymbolObject({
                            name: 'flags',
                            properties: {
                                FLAG1: SymbolBoolean({ name: 'FLAG1' }),
                                FLAG2: SymbolBoolean({ name: 'FLAG2' }),
                                FLAG3: SymbolBoolean({ name: 'FLAG3' }),
                                FLAG4: SymbolBoolean({ name: 'FLAG4' }),
                            },
                            methods: [],
                        }),
                        ref: 'visitor.claims.flags',
                        parentRef: 'visitor.claims',
                        childrenRefs: [
                            'visitor.claims.flags.FLAG1',
                            'visitor.claims.flags.FLAG2',
                            'visitor.claims.flags.FLAG3',
                            'visitor.claims.flags.FLAG4',
                        ],
                    },
                },
            ],
        },
    ];
    it.each(SCENARIOS)(
        'should provide matching suggestion for expression with cursor: $expressionWithCursor',
        ({ expressionWithCursor, expectedSuggestions }) => {
            const { expression, cursorOffset } = extractCursorPosition(
                expressionWithCursor,
                '<cur>'
            );
            const { suggestions } = runtime.autocomplete(expression, cursorOffset, context);
            expect(suggestions).toStrictEqual(expectedSuggestions);
        }
    );
});

function extractCursorPosition(
    expressionWithCursor: string,
    cursorPlaceholder: string
): { expression: string; cursorOffset: number } {
    const cursorOffset = expressionWithCursor.indexOf(cursorPlaceholder);
    if (cursorOffset === -1) {
        throw new Error(
            `Cursor position (${cursorPlaceholder}) not found in the expression string.`
        );
    }

    const expression = expressionWithCursor.replace(cursorPlaceholder, '');
    return { expression, cursorOffset };
}
