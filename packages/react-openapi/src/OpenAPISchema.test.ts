import { describe, expect, it } from 'bun:test';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { getSchemaAlternatives, getSchemaProperties } from './OpenAPISchema';

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

    it('should handle non-standard boolean required values without throwing', () => {
        // Some specs (e.g. Trustly) use `"required": true` on properties
        // instead of the standard `string[]` format. This should not throw.
        const schema = {
            allOf: [
                {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                    },
                    required: true as any,
                },
                {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                    },
                    required: ['email'],
                },
            ],
        } as any;

        const result = getSchemaAlternatives(schema);
        expect(result).toBeDefined();
        // The boolean `required: true` should be ignored, only the valid array is kept
        expect(result?.schemas[0]?.required).toEqual(['email']);
    });

    it('should handle boolean required on both schemas without throwing', () => {
        const schema = {
            allOf: [
                {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                    },
                    required: true as any,
                },
                {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                    },
                    required: false as any,
                },
            ],
        } as any;

        const result = getSchemaAlternatives(schema);
        expect(result).toBeDefined();
        // Boolean required values should not cause a crash, result is an empty array
        expect(result?.schemas[0]?.required).toEqual([]);
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

        it('should merge annotation-only schema into object schema', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                            },
                            required: ['id'],
                        },
                        {
                            description: 'Overridden description',
                        } as any,
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                        },
                        required: ['id'],
                        description: 'Overridden description',
                    },
                ],
            });
        });

        it('should preserve parent metadata when flattening allOf inside oneOf alternative', () => {
            const result = getSchemaAlternatives({
                oneOf: [
                    {
                        title: 'Option A',
                        description: 'First option',
                        'x-custom': 'custom-value',
                        allOf: [
                            {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                },
                                required: ['name'],
                            },
                            {
                                type: 'object',
                                properties: {
                                    age: { type: 'integer' },
                                },
                            },
                        ],
                    },
                    {
                        type: 'string',
                    },
                ],
            });

            expect(result).toEqual({
                type: 'oneOf',
                schemas: [
                    {
                        title: 'Option A',
                        description: 'First option',
                        'x-custom': 'custom-value',
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            age: { type: 'integer' },
                        },
                        required: ['name'],
                    },
                    {
                        type: 'string',
                    },
                ],
            });
        });

        it('should merge annotation-only schema with multiple safe extensions', () => {
            expect(
                getSchemaAlternatives({
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                            },
                            required: ['id'],
                            description: 'Original description',
                        },
                        {
                            description: 'Overridden description',
                            title: 'Overridden title',
                            deprecated: true,
                        } as any,
                    ],
                })
            ).toEqual({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                        required: ['id'],
                        description: 'Overridden description',
                        title: 'Overridden title',
                        deprecated: true,
                    },
                ],
            });
        });

        it('should preserve parent metadata when flattening allOf inside anyOf alternative', () => {
            const result = getSchemaAlternatives({
                anyOf: [
                    {
                        title: 'Variant B',
                        description: 'A variant with extensions',
                        'x-deprecated-reason': 'use v2',
                        allOf: [
                            {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                },
                            },
                            {
                                type: 'object',
                                properties: {
                                    value: { type: 'number' },
                                },
                            },
                        ],
                    },
                ],
            });

            expect(result).toEqual({
                type: 'anyOf',
                schemas: [
                    {
                        title: 'Variant B',
                        description: 'A variant with extensions',
                        'x-deprecated-reason': 'use v2',
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            value: { type: 'number' },
                        },
                        required: [],
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

        it('should merge nested allOf with parent properties', () => {
            const result = getSchemaAlternatives({
                allOf: [
                    {
                        type: 'object',
                        allOf: [
                            {
                                type: 'object',
                                allOf: [
                                    {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'integer',
                                                format: 'int32',
                                            },
                                        },
                                        required: ['id'],
                                        additionalProperties: false,
                                    },
                                ],
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                },
                                required: ['name'],
                                additionalProperties: false,
                            },
                        ],
                        properties: {
                            key: {
                                type: 'string',
                            },
                        },
                        required: ['key'],
                        additionalProperties: false,
                    },
                ],
                properties: {
                    labelArgbColor: {
                        type: 'integer',
                        format: 'int32',
                    },
                },
                required: ['labelArgbColor'],
            });

            expect(result).toMatchObject({
                type: 'allOf',
                schemas: [
                    {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'integer',
                                format: 'int32',
                            },
                            name: {
                                type: 'string',
                            },
                            key: {
                                type: 'string',
                            },
                            labelArgbColor: {
                                type: 'integer',
                                format: 'int32',
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            });

            // Check that all required fields are present (order doesn't matter)
            expect(result?.schemas[0]?.required).toHaveLength(4);
            expect(result?.schemas[0]?.required).toContain('id');
            expect(result?.schemas[0]?.required).toContain('name');
            expect(result?.schemas[0]?.required).toContain('key');
            expect(result?.schemas[0]?.required).toContain('labelArgbColor');
        });
    });
});

describe('getSchemaProperties', () => {
    it('should merge required fields from allOf schemas', () => {
        const schema: OpenAPIV3.SchemaObject = {
            allOf: [
                {
                    type: 'object',
                    properties: { id: { type: 'integer' } },
                    required: ['id'],
                },
                {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                    required: ['name'],
                },
            ],
        };

        const result = getSchemaProperties(schema);
        expect(result?.find((p) => p.propertyName === 'id')?.required).toBe(true);
        expect(result?.find((p) => p.propertyName === 'name')?.required).toBe(true);
    });

    it('should deep-merge overlapping properties from allOf schemas', () => {
        const schema: OpenAPIV3.SchemaObject = {
            allOf: [
                {
                    type: 'object',
                    properties: {
                        tags: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    color: { type: 'string' },
                                    category: {
                                        type: 'object',
                                        properties: { icon: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    type: 'object',
                    properties: {
                        tags: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer' },
                                    category: {
                                        type: 'object',
                                        properties: { name: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                },
            ],
        };

        const result = getSchemaProperties(schema);
        const tagItemProps =
            (
                result?.find((p) => p.propertyName === 'tags')?.schema
                    ?.items as OpenAPIV3.SchemaObject
            )?.properties ?? {};

        // Array items merged from both branches
        expect(tagItemProps).toHaveProperty('id');
        expect(tagItemProps).toHaveProperty('color');

        // Nested object properties also deep-merged
        const categoryProps = (tagItemProps.category as OpenAPIV3.SchemaObject)?.properties ?? {};
        expect(categoryProps).toHaveProperty('name');
        expect(categoryProps).toHaveProperty('icon');
    });
});
