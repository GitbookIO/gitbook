import { describe, expect, it } from 'bun:test';

import { SymbolArray, SymbolObject, SymbolString } from '../symbols';
import { SymbolsTable } from '../symbols-table';
import type { SymbolType } from '../types';

describe('ExpressionRuntime', () => {
    const initialSymbols = {
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
                                FLAG1: SymbolString({ name: 'FLAG1' }),
                                FLAG2: SymbolString({ name: 'FLAG2' }),
                                FLAG3: SymbolString({ name: 'FLAG3' }),
                            },
                            methods: [],
                        }),
                        hello: SymbolArray({
                            name: 'hello',
                            description: 'An array of string',
                            items: SymbolString(),
                        }),
                    },
                    methods: [],
                }),
            },
            methods: [],
        }),
    };
    describe('addSymbols', () => {
        it('should the symbols matching the provided object to the table', () => {
            const symbolsTable = new SymbolsTable(initialSymbols);

            expect(symbolsTable.getSymbolInfo(['visitor'])).toMatchObject({
                definition: {
                    type: 'object',
                    name: 'visitor',
                    properties: {
                        claims: {
                            type: 'object',
                            name: 'claims',
                            description: 'The claims contained in the visitor JWT token',
                            properties: {
                                key: {
                                    type: 'string',
                                    name: 'key',
                                },
                                flags: {
                                    type: 'object',
                                    name: 'flags',
                                    properties: {
                                        FLAG1: {
                                            type: 'string',
                                            name: 'FLAG1',
                                        },
                                        FLAG2: {
                                            type: 'string',
                                            name: 'FLAG2',
                                        },
                                        FLAG3: {
                                            type: 'string',
                                            name: 'FLAG3',
                                        },
                                    },
                                    methods: [],
                                },
                                hello: {
                                    type: 'array',
                                    name: 'hello',
                                    description: 'An array of string',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                            methods: [],
                        },
                    },
                    methods: [],
                },
                ref: 'visitor',
                childrenRefs: ['visitor.claims'],
            });

            symbolsTable.addSymbols({
                space: SymbolObject({
                    name: 'space',
                    properties: {
                        id: SymbolString({ name: 'id' }),
                        title: SymbolString({ name: 'title' }),
                    },
                    methods: [],
                }),
            });

            expect(symbolsTable.getSymbolInfo(['space'])).toMatchObject({
                definition: {
                    type: 'object',
                    name: 'space',
                    properties: {
                        id: {
                            type: 'string',
                            name: 'id',
                        },
                        title: {
                            type: 'string',
                            name: 'title',
                        },
                    },
                    methods: [],
                },
                ref: 'space',
                childrenRefs: ['space.id', 'space.title'],
            });
        });
    });

    describe('Symbols standard library', () => {
        it('should allow to access methods & properties defined as part of the standard library', () => {
            const symbolsTable = new SymbolsTable({
                id: SymbolString({ name: 'id' }),
                title: SymbolString({ name: 'title' }),
            });

            expect(
                symbolsTable.getSymbolInfo<SymbolType.String>('id')?.definition.properties.length
            ).toMatchObject({
                type: 'number',
                name: 'length',
                description:
                    'The length data property of a String value contains the length of the string in UTF-16 code units.',
            });
        });
    });

    describe('getSymbolInfo', () => {
        it('should add the symbols matching the initial symbol definition passed to the constructor', () => {
            const symbolsTable = new SymbolsTable(initialSymbols);

            expect(symbolsTable.getSymbolInfo(['visitor'])).toMatchObject({
                definition: {
                    type: 'object',
                    name: 'visitor',
                    properties: {
                        claims: {
                            type: 'object',
                            name: 'claims',
                            description: 'The claims contained in the visitor JWT token',
                            properties: {
                                key: {
                                    type: 'string',
                                    name: 'key',
                                },
                                flags: {
                                    type: 'object',
                                    name: 'flags',
                                    properties: {
                                        FLAG1: {
                                            type: 'string',
                                            name: 'FLAG1',
                                        },
                                        FLAG2: {
                                            type: 'string',
                                            name: 'FLAG2',
                                        },
                                        FLAG3: {
                                            type: 'string',
                                            name: 'FLAG3',
                                        },
                                    },
                                    methods: [],
                                },
                                hello: {
                                    type: 'array',
                                    name: 'hello',
                                    description: 'An array of string',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                            methods: [],
                        },
                    },
                    methods: [],
                },
                ref: 'visitor',
                childrenRefs: ['visitor.claims'],
            });

            expect(symbolsTable.getSymbolInfo(['visitor', 'claims'])).toMatchObject({
                definition: {
                    type: 'object',
                    name: 'claims',
                    description: 'The claims contained in the visitor JWT token',
                    properties: {
                        key: {
                            type: 'string',
                            name: 'key',
                        },
                        flags: {
                            type: 'object',
                            name: 'flags',
                            properties: {
                                FLAG1: {
                                    type: 'string',
                                    name: 'FLAG1',
                                },
                                FLAG2: {
                                    type: 'string',
                                    name: 'FLAG2',
                                },
                                FLAG3: {
                                    type: 'string',
                                    name: 'FLAG3',
                                },
                            },
                            methods: [],
                        },
                        hello: {
                            type: 'array',
                            name: 'hello',
                            description: 'An array of string',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                    methods: [],
                },
                ref: 'visitor.claims',
                parentRef: 'visitor',
                childrenRefs: [
                    'visitor.claims.key',
                    'visitor.claims.flags',
                    'visitor.claims.hello',
                ],
            });

            expect(symbolsTable.getSymbolInfo(['visitor', 'claims', 'key'])).toMatchObject({
                definition: {
                    type: 'string',
                    name: 'key',
                },
                ref: 'visitor.claims.key',
                parentRef: 'visitor.claims',
                childrenRefs: [
                    'visitor.claims.key.length',
                    'visitor.claims.key.at',
                    'visitor.claims.key.endsWith',
                    'visitor.claims.key.includes',
                ],
            });

            expect(symbolsTable.getSymbolInfo(['visitor', 'claims', 'flags'])).toMatchObject({
                definition: {
                    type: 'object',
                    name: 'flags',
                    properties: {
                        FLAG1: {
                            type: 'string',
                            name: 'FLAG1',
                        },
                        FLAG2: {
                            type: 'string',
                            name: 'FLAG2',
                        },
                        FLAG3: {
                            type: 'string',
                            name: 'FLAG3',
                        },
                    },
                    methods: [],
                },
                ref: 'visitor.claims.flags',
                parentRef: 'visitor.claims',
                childrenRefs: [
                    'visitor.claims.flags.FLAG1',
                    'visitor.claims.flags.FLAG2',
                    'visitor.claims.flags.FLAG3',
                ],
            });

            expect(
                symbolsTable.getSymbolInfo(['visitor', 'claims', 'flags', 'FLAG1'])
            ).toMatchObject({
                definition: {
                    type: 'string',
                    name: 'FLAG1',
                },
                ref: 'visitor.claims.flags.FLAG1',
                parentRef: 'visitor.claims.flags',
                childrenRefs: [
                    'visitor.claims.flags.FLAG1.length',
                    'visitor.claims.flags.FLAG1.at',
                    'visitor.claims.flags.FLAG1.endsWith',
                    'visitor.claims.flags.FLAG1.includes',
                ],
            });

            expect(
                symbolsTable.getSymbolInfo(['visitor', 'claims', 'flags', 'FLAG2'])
            ).toMatchObject({
                definition: {
                    type: 'string',
                    name: 'FLAG2',
                },
                ref: 'visitor.claims.flags.FLAG2',
                parentRef: 'visitor.claims.flags',
                childrenRefs: [
                    'visitor.claims.flags.FLAG2.length',
                    'visitor.claims.flags.FLAG2.at',
                    'visitor.claims.flags.FLAG2.endsWith',
                    'visitor.claims.flags.FLAG2.includes',
                ],
            });

            expect(symbolsTable.getSymbolInfo(['visitor', 'claims', 'hello'])).toMatchObject({
                definition: {
                    type: 'array',
                    name: 'hello',
                    description: 'An array of string',
                    items: {
                        type: 'string',
                    },
                },
                ref: 'visitor.claims.hello',
                parentRef: 'visitor.claims',
                childrenRefs: [
                    'visitor.claims.hello.length',
                    'visitor.claims.hello.at',
                    'visitor.claims.hello.includes',
                    'visitor.claims.hello.some',
                    'visitor.claims.hello.every',
                ],
            });
        });
    });

    describe('inferSymbolFromValue', () => {
        it('should infer properly a symbol based on a value', () => {
            const symbolDef = SymbolsTable.inferSymbolFromValue(
                {
                    visitor: {
                        claims: {
                            key: 'test',
                            flags: {
                                FLAG1: 'testflag1',
                                FLAG2: 'testflag2',
                                FLAG3: 'testflag3',
                            },
                            hello: ['test', 'test1', 'test2'],
                        },
                    },
                },
                'context'
            );
            expect(symbolDef).toMatchObject({
                type: 'object',
                name: 'context',
                properties: {
                    visitor: {
                        type: 'object',
                        name: 'visitor',
                        properties: {
                            claims: {
                                type: 'object',
                                name: 'claims',
                                properties: {
                                    key: {
                                        type: 'string',
                                        name: 'key',
                                    },
                                    flags: {
                                        type: 'object',
                                        name: 'flags',
                                        properties: {
                                            FLAG1: {
                                                type: 'string',
                                                name: 'FLAG1',
                                            },
                                            FLAG2: {
                                                type: 'string',
                                                name: 'FLAG2',
                                            },
                                            FLAG3: {
                                                type: 'string',
                                                name: 'FLAG3',
                                            },
                                        },
                                        methods: [],
                                    },
                                    hello: {
                                        type: 'array',
                                        name: 'hello',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                },
                                methods: [],
                            },
                        },
                        methods: [],
                    },
                },
                methods: [],
            });
        });
    });

    describe('inferSymbolFromJSONSchema', () => {
        it('should infer properly a symbol table based on a JSON schema', () => {
            const symbolDef = SymbolsTable.inferSymbolFromJSONSchema(
                {
                    type: 'object',
                    description: `The attributes tied to a site's visitor.`,
                    properties: {
                        claims: {
                            type: 'object',
                            properties: {
                                key: {
                                    type: 'string',
                                },
                                flags: {
                                    type: 'object',
                                    description: 'The user feature flags',
                                    properties: {
                                        FLAG1: { type: 'string' },
                                        FLAG2: { type: 'string' },
                                        FLAG3: { type: 'string' },
                                    },
                                },
                                hello: {
                                    type: 'string',
                                    enum: ['test', 'test1', 'test2'],
                                },
                            },
                        },
                    },
                },
                'visitor'
            );
            expect(symbolDef).toMatchObject({
                type: 'object',
                name: 'visitor',
                description: `The attributes tied to a site's visitor.`,
                properties: {
                    claims: {
                        type: 'object',
                        name: 'claims',
                        properties: {
                            key: {
                                type: 'string',
                                name: 'key',
                            },
                            flags: {
                                type: 'object',
                                name: 'flags',
                                description: 'The user feature flags',
                                properties: {
                                    FLAG1: {
                                        type: 'string',
                                        name: 'FLAG1',
                                    },
                                    FLAG2: {
                                        type: 'string',
                                        name: 'FLAG2',
                                    },
                                    FLAG3: {
                                        type: 'string',
                                        name: 'FLAG3',
                                    },
                                },
                                methods: [],
                            },
                            hello: {
                                type: 'string',
                                enum: ['test', 'test1', 'test2'],
                            },
                        },
                        methods: [],
                    },
                },
                methods: [],
            });
        });
    });
});
