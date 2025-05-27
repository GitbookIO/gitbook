import { describe, expect, it } from 'bun:test';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { generateSchemaExample } from './generateSchemaExample';

describe('generateSchemaExample', () => {
    it('sets example values', () => {
        expect(
            generateSchemaExample({
                example: 10,
            })
        ).toBe(10);
    });

    it('uses first example, if multiple are configured', () => {
        expect(
            generateSchemaExample({
                examples: [10],
            })
        ).toBe(10);
    });

    it('takes the first enum as example', () => {
        expect(
            generateSchemaExample({
                enum: ['available', 'pending', 'sold'],
            })
        ).toBe('available');
    });

    it('uses "text" as a fallback for strings', () => {
        expect(
            generateSchemaExample({
                type: 'string',
            })
        ).toBe('text');
    });

    it('only includes required attributes and attributes with example values', () => {
        expect(
            generateSchemaExample(
                {
                    type: 'object',
                    required: ['first_name'],
                    properties: {
                        first_name: {
                            type: 'string',
                        },
                        last_name: {
                            type: 'string',
                            required: true,
                        },
                        position: {
                            type: 'string',
                            examples: ['Developer'],
                        },
                        description: {
                            type: 'string',
                            example: 'A developer',
                        },
                        age: {
                            type: 'number',
                        },
                    },
                },
                {
                    omitEmptyAndOptionalProperties: true,
                }
            )
        ).toStrictEqual({
            first_name: 'text',
            last_name: 'text',
            position: 'Developer',
            description: 'A developer',
        });
    });

    it('includes every available attributes', () => {
        expect(
            generateSchemaExample(
                {
                    type: 'object',
                    required: ['first_name'],
                    properties: {
                        first_name: {
                            type: 'string',
                        },
                        last_name: {
                            type: 'string',
                            required: true,
                        },
                        position: {
                            type: 'string',
                            examples: ['Developer'],
                        },
                        description: {
                            type: 'string',
                            example: 'A developer',
                        },
                        age: {
                            type: 'number',
                        },
                    },
                },
                {
                    omitEmptyAndOptionalProperties: false,
                }
            )
        ).toStrictEqual({
            first_name: 'text',
            last_name: 'text',
            position: 'Developer',
            description: 'A developer',
            age: 1,
        });
    });

    it('uses example value for first type in non-null union types', () => {
        expect(
            generateSchemaExample({
                type: ['string', 'number'],
            } as OpenAPIV3.BaseSchemaObject)
        ).toBe('text');
    });

    it('uses null for nullable union types', () => {
        expect(
            generateSchemaExample({
                type: ['string', 'null'],
            } as OpenAPIV3.BaseSchemaObject)
        ).toBeNull();
    });

    it('sets example values', () => {
        expect(
            generateSchemaExample({
                example: 10,
            })
        ).toBe(10);
    });

    it('goes through properties recursively with objects', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                properties: {
                    category: {
                        type: 'object',
                        properties: {
                            id: {
                                example: 1,
                            },
                            name: {
                                example: 'Dogs',
                            },
                            attributes: {
                                type: 'object',
                                properties: {
                                    size: {
                                        enum: ['small', 'medium', 'large'],
                                    },
                                },
                            },
                        },
                    },
                },
            })
        ).toMatchObject({
            category: {
                id: 1,
                name: 'Dogs',
                attributes: {
                    size: 'small',
                },
            },
        });
    });

    it('goes through properties recursively with arrays', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    example: 1,
                                },
                            },
                        },
                    },
                },
            })
        ).toMatchObject({
            tags: [
                {
                    id: 1,
                },
            ],
        });
    });

    it('uses empty [] as a fallback for arrays', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                properties: {
                    title: {
                        type: 'array',
                    },
                },
            })
        ).toMatchObject({
            title: [],
        });
    });

    // it('returns emails as an example value', () => {
    //     const result = generateSchemaExample({
    //         type: 'string',
    //         format: 'email',
    //     });

    //     function isEmail(text: string) {
    //         return !!text.match(/^.+@.+\..+$/);
    //     }

    //     expect(isEmail(result)).toBe(true);
    // });

    it('uses true as a fallback for booleans', () => {
        expect(
            generateSchemaExample({
                type: 'boolean',
            })
        ).toBe(true);
    });

    it('uses 1 as a fallback for integers', () => {
        expect(
            generateSchemaExample({
                type: 'integer',
            })
        ).toBe(1);
    });

    it('returns an array if the schema type is array', () => {
        expect(
            generateSchemaExample({
                type: 'array',
            })
        ).toMatchObject([]);
    });

    it('uses array example values', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                example: ['foobar'],
                items: {
                    type: 'string',
                },
            })
        ).toMatchObject(['foobar']);
    });

    it('uses specified object as array default', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        foo: {
                            type: 'number',
                        },
                        bar: {
                            type: 'string',
                        },
                    },
                },
            })
        ).toMatchObject([
            {
                foo: 1,
                bar: 'text',
            },
        ]);
    });

    it('uses the first example in object anyOf', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            foo: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            bar: { type: 'string' },
                        },
                    },
                ],
            })
        ).toMatchObject({ foo: 1 });
    });

    it('uses the first example in object oneOf', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            foo: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            bar: { type: 'string' },
                        },
                    },
                ],
            })
        ).toMatchObject({ foo: 1 });
    });

    it('uses the first example in object anyOf when type is not defined', () => {
        expect(
            generateSchemaExample({
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            foo: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            bar: { type: 'string' },
                        },
                    },
                ],
            })
        ).toMatchObject({ foo: 1 });
    });

    it('uses the first example in object oneOf when type is not defined', () => {
        expect(
            generateSchemaExample({
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            foo: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            bar: { type: 'string' },
                        },
                    },
                ],
            })
        ).toMatchObject({ foo: 1 });
    });

    it('uses all examples in object allOf', () => {
        expect(
            generateSchemaExample({
                allOf: [
                    {
                        type: 'object',
                        properties: {
                            foo: { type: 'number' },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            bar: { type: 'string' },
                        },
                    },
                ],
            })
        ).toMatchObject({ foo: 1, bar: 'text' });
    });

    it('merges allOf items in arrays', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                foobar: { type: 'string' },
                                foo: { type: 'number' },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                bar: { type: 'string' },
                            },
                        },
                    ],
                },
            })
        ).toMatchObject([{ foobar: 'text', foo: 1, bar: 'text' }]);
    });

    it('handles array items with allOf containing objects', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    allOf: [
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'test' },
                            },
                        },
                    ],
                },
            })
        ).toMatchObject([
            {
                id: 1,
                name: 'test',
            },
        ]);
    });

    it('uses the first example in array anyOf', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    anyOf: [
                        {
                            type: 'string',
                            example: 'foobar',
                        },
                        {
                            type: 'string',
                            example: 'barfoo',
                        },
                    ],
                },
            })
        ).toMatchObject(['foobar']);
    });

    it('uses one example in array oneOf', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    oneOf: [
                        {
                            type: 'string',
                            example: 'foobar',
                        },
                        {
                            type: 'string',
                            example: 'barfoo',
                        },
                    ],
                },
            })
        ).toMatchObject(['foobar']);
    });

    it('uses all examples in array allOf', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    allOf: [
                        {
                            type: 'string',
                            example: 'foobar',
                        },
                        {
                            type: 'string',
                            example: 'barfoo',
                        },
                    ],
                },
            })
        ).toMatchObject(['foobar', 'barfoo']);
    });

    it('uses 1 as the default for a number', () => {
        expect(
            generateSchemaExample({
                type: 'number',
            })
        ).toBe(1);
    });

    it('uses min as the default for a number', () => {
        expect(
            generateSchemaExample({
                type: 'number',
                min: 200,
            })
        ).toBe(200);
    });

    it('returns plaintext', () => {
        expect(
            generateSchemaExample({
                type: 'string',
                example: 'foobar',
            })
        ).toEqual('foobar');
    });

    it('converts a whole schema to an example response', () => {
        const schema: OpenAPIV3.SchemaObject = {
            required: ['name', 'photoUrls'],
            type: 'object',
            properties: {
                id: {
                    type: 'integer',
                    format: 'int64',
                    example: 10,
                },
                name: {
                    type: 'string',
                    example: 'doggie',
                },
                category: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            format: 'int64',
                            example: 1,
                        },
                        name: {
                            type: 'string',
                            example: 'Dogs',
                        },
                    },
                    xml: {
                        name: 'category',
                    },
                },
                photoUrls: {
                    type: 'array',
                    xml: {
                        wrapped: true,
                    },
                    items: {
                        type: 'string',
                        xml: {
                            name: 'photoUrl',
                        },
                    },
                },
                tags: {
                    type: 'array',
                    xml: {
                        wrapped: true,
                    },
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'integer',
                                format: 'int64',
                            },
                            name: {
                                type: 'string',
                            },
                        },
                        xml: {
                            name: 'tag',
                        },
                    },
                },
                status: {
                    type: 'string',
                    description: 'pet status in the store',
                    enum: ['available', 'pending', 'sold'],
                },
            },
            xml: {
                name: 'pet',
            },
        };

        expect(generateSchemaExample(schema)).toMatchObject({
            id: 10,
            name: 'doggie',
            category: {
                id: 1,
                name: 'Dogs',
            },
            photoUrls: ['text'],
            tags: [
                {
                    id: 1,
                    name: 'text',
                },
            ],
            status: 'available',
        });
    });

    it('outputs XML', () => {
        expect(
            generateSchemaExample(
                {
                    type: 'object',
                    properties: {
                        id: {
                            example: 1,
                            xml: {
                                name: 'foo',
                            },
                        },
                    },
                },
                { xml: true }
            )
        ).toMatchObject({
            foo: 1,
        });
    });

    it('add XML wrappers where needed', () => {
        expect(
            generateSchemaExample(
                {
                    type: 'object',
                    properties: {
                        photoUrls: {
                            type: 'array',
                            xml: {
                                wrapped: true,
                            },
                            items: {
                                type: 'string',
                                example: 'https://example.com',
                                xml: {
                                    name: 'photoUrl',
                                },
                            },
                        },
                    },
                },
                { xml: true }
            )
        ).toMatchObject({
            photoUrls: [{ photoUrl: 'https://example.com' }],
        });
    });

    it('doesn’t wrap items when not needed', () => {
        expect(
            generateSchemaExample(
                {
                    type: 'object',
                    properties: {
                        photoUrls: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: 'https://example.com',
                                xml: {
                                    name: 'photoUrl',
                                },
                            },
                        },
                    },
                },
                { xml: true }
            )
        ).toMatchObject({
            photoUrls: ['https://example.com'],
        });
    });

    it('use the first item of oneOf', () => {
        expect(
            generateSchemaExample({
                oneOf: [
                    {
                        maxLength: 255,
                        type: 'string',
                    },
                    {
                        type: 'null',
                    },
                ],
            })
        ).toBe('text');
    });

    it('works with allOf', () => {
        expect(
            generateSchemaExample({
                allOf: [
                    {
                        type: 'string',
                    },
                ],
            })
        ).toBe('text');
    });

    it('uses all schemas in allOf', () => {
        expect(
            generateSchemaExample({
                allOf: [
                    {
                        type: 'object',
                        properties: {
                            id: {
                                example: 10,
                            },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            title: {
                                example: 'Foobar',
                            },
                        },
                    },
                ],
            })
        ).toMatchObject({
            id: 10,
            title: 'Foobar',
        });
    });

    it('returns null for unknown types', () => {
        expect(
            generateSchemaExample({
                type: 'fantasy',
            } as OpenAPIV3.BaseSchemaObject)
        ).toBe(null);
    });

    it('returns readOnly attributes by default', () => {
        expect(
            generateSchemaExample({
                example: 'foobar',
                readOnly: true,
            })
        ).toBe('foobar');
    });

    it('returns readOnly attributes in read mode', () => {
        expect(
            generateSchemaExample(
                {
                    example: 'foobar',
                    readOnly: true,
                },
                {
                    mode: 'read',
                }
            )
        ).toBe('foobar');
    });

    it('doesn’t return readOnly attributes in write mode', () => {
        expect(
            generateSchemaExample(
                {
                    example: 'foobar',
                    readOnly: true,
                },
                {
                    mode: 'write',
                }
            )
        ).toBeUndefined();
    });

    it('returns writeOnly attributes by default', () => {
        expect(
            generateSchemaExample({
                example: 'foobar',
                writeOnly: true,
            })
        ).toBe('foobar');
    });

    it('returns writeOnly attributes in write mode', () => {
        expect(
            generateSchemaExample(
                {
                    example: 'foobar',
                    writeOnly: true,
                },
                {
                    mode: 'write',
                }
            )
        ).toBe('foobar');
    });

    it('doesn’t return writeOnly attributes in read mode', () => {
        expect(
            generateSchemaExample(
                {
                    example: 'foobar',
                    writeOnly: true,
                },
                {
                    mode: 'read',
                }
            )
        ).toBeUndefined();
    });

    it('allows any additonalProperty', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: {},
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: 'anything',
        });

        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: true,
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: 'anything',
        });
    });

    it('adds an additionalProperty with specific types', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: {
                    type: 'integer',
                },
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: 1,
        });

        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: {
                    type: 'boolean',
                },
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: true,
        });

        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: {
                    type: 'string',
                },
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: 'text',
        });

        expect(
            generateSchemaExample({
                type: 'object',
                additionalProperties: {
                    type: 'object',
                    properties: {
                        foo: {
                            type: 'string',
                        },
                    },
                },
            })
        ).toMatchObject({
            ANY_ADDITIONAL_PROPERTY: {
                foo: 'text',
            },
        });
    });

    it('works with anyOf', () => {
        expect(
            generateSchemaExample({
                title: 'Foo',
                type: 'object',
                anyOf: [
                    {
                        type: 'object',
                        required: ['a'],
                        properties: {
                            a: {
                                type: 'integer',
                                format: 'int32',
                            },
                        },
                    },
                    {
                        type: 'object',
                        required: ['b'],
                        properties: {
                            b: {
                                type: 'string',
                            },
                        },
                    },
                ],
                required: ['c'],
                properties: {
                    c: {
                        type: 'boolean',
                    },
                },
            })
        ).toStrictEqual({
            a: 1,
            c: true,
        });
    });

    it('deals with circular references', () => {
        const schema = {
            type: 'object',
            properties: {
                foobar: {},
            },
        } satisfies OpenAPIV3.SchemaObject;

        // Create a circular reference
        schema.properties.foobar = schema;

        // 10 levels deep, that’s enough. It should return null then.
        expect(generateSchemaExample(schema)).toStrictEqual({
            foobar: {
                foobar: {
                    foobar: {
                        foobar: {
                            foobar: {
                                foobar: '[Circular Reference]',
                            },
                        },
                    },
                },
            },
        });
    });

    it('handles patternProperties', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                patternProperties: {
                    '^(.*)$': {
                        type: 'object',
                        properties: {
                            dataId: {
                                type: 'string',
                            },
                            link: {
                                anyOf: [
                                    {
                                        format: 'uri',
                                        type: 'string',
                                        example: 'https://example.com',
                                    },
                                    {
                                        type: 'null',
                                    },
                                ],
                            },
                        },
                        required: ['dataId', 'link'],
                    },
                },
            })
        ).toStrictEqual({
            '^(.*)$': {
                dataId: 'text',
                link: 'https://example.com',
            },
        });
    });

    it('handles deprecated properties', () => {
        expect(
            generateSchemaExample({
                type: 'object',
                deprecated: true,
            })
        ).toBeUndefined();
    });

    it('handle nested deprecated properties', () => {
        expect(
            generateSchemaExample({
                type: 'array',
                items: {
                    deprecated: true,
                },
            })
        ).toBeUndefined();
    });
});
