import { describe, expect, it } from 'bun:test';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { getSchemaAlternatives } from './OpenAPISchema';

describe('getSchemaAlternatives', () => {
    it('should flatten oneOf', () => {
        expect(
            getSchemaAlternatives({
                oneOf: [
                    {
                        oneOf: [
                            {
                                type: 'number',
                            },
                            {
                                type: 'boolean',
                            },
                        ],
                    },
                    {
                        type: 'string',
                    },
                ],
            })
        ).toEqual({
            type: 'oneOf',
            schemas: [
                {
                    type: 'number',
                },
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                },
            ],
        });
    });

    it('merges string enum', () => {
        expect(
            getSchemaAlternatives({
                oneOf: [
                    {
                        oneOf: [
                            {
                                type: 'string',
                                enum: ['a', 'b'],
                            },
                            {
                                type: 'string',
                                enum: ['c', 'd'],
                                nullable: true,
                            },
                        ],
                    },
                ],
            })
        ).toEqual({
            type: 'oneOf',
            schemas: [
                {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    nullable: true,
                },
            ],
        });
    });

    it('merges objects with allOf', () => {
        expect(
            getSchemaAlternatives({
                allOf: [
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                            map: {
                                type: 'string',
                            },
                            description: {
                                type: 'string',
                            },
                        },
                        required: ['name'],
                    },
                    {
                        type: 'object',
                        properties: {
                            externalId: {
                                type: 'string',
                            },
                        },
                        required: ['map', 'externalId'],
                    },
                ],
            })
        ).toEqual({
            type: 'allOf',
            schemas: [
                {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                        map: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        externalId: {
                            type: 'string',
                        },
                    },
                    required: ['name', 'map', 'externalId'],
                },
            ],
        });
    });

    it('should not flatten oneOf and allOf', () => {
        expect(
            getSchemaAlternatives({
                oneOf: [
                    {
                        allOf: [
                            {
                                type: 'number',
                            },
                            {
                                type: 'boolean',
                            },
                        ],
                    },
                    {
                        type: 'string',
                    },
                ],
            })
        ).toEqual({
            type: 'oneOf',
            schemas: [
                {
                    allOf: [
                        {
                            type: 'number',
                        },
                        {
                            type: 'boolean',
                        },
                    ],
                },
                {
                    type: 'string',
                },
            ],
        });
    });

    it('should stop at circular references', () => {
        const a: OpenAPIV3.SchemaObject = {
            anyOf: [
                {
                    type: 'string',
                },
            ],
        };

        a.anyOf?.push(a);

        expect(getSchemaAlternatives(a)).toEqual({
            type: 'anyOf',
            schemas: [
                {
                    type: 'string',
                },
                a,
            ],
        });
    });

    describe('safe merging with allOf', () => {
        it('should merge objects with safe extensions', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                },
                            },
                            required: ['name'],
                            description: 'Base schema',
                            title: 'Base',
                        },
                        {
                            type: 'object',
                            properties: {
                                email: {
                                    type: 'string',
                                },
                            },
                            required: ['email'],
                            description: 'Extended schema',
                            example: { email: 'test@example.com' },
                            deprecated: true,
                        },
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                            email: {
                                type: 'string',
                            },
                        },
                        required: ['name', 'email'],
                        description: 'Extended schema',
                        title: 'Base',
                        example: { email: 'test@example.com' },
                        deprecated: true,
                    },
                ],
            });
        });

        it('should merge objects with vendor extensions', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                },
                            },
                            'x-internal': true,
                        },
                        {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                },
                            },
                            'x-version': '1.0',
                            'x-internal': false,
                        },
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                            },
                            name: {
                                type: 'string',
                            },
                        },
                        required: [],
                        'x-internal': false,
                        'x-version': '1.0',
                    },
                ],
            });
        });

        it('should merge objects with nullable', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                field1: {
                                    type: 'string',
                                },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                field2: {
                                    type: 'string',
                                },
                            },
                            nullable: true,
                        },
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            field1: {
                                type: 'string',
                            },
                            field2: {
                                type: 'string',
                            },
                        },
                        required: [],
                        nullable: true,
                    },
                ],
            });
        });

        it('should NOT merge objects with unsafe properties', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                value: {
                                    type: 'string',
                                },
                            },
                            // oneOf is not a safe property to merge
                            oneOf: [
                                {
                                    type: 'string',
                                },
                            ],
                        },
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                            },
                        },
                        oneOf: [
                            {
                                type: 'string',
                            },
                        ],
                    },
                ],
            });
        });
    });
});
