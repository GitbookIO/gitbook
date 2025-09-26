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
});
