import { describe, expect, it } from 'bun:test';
import { type OpenAPIV3, parseOpenAPI } from '@gitbook/openapi-parser';
import { getSchemaAlternatives } from './OpenAPISchema';
import { dereferenceFilesystem } from './dereference';

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

    describe('circular oneOf with discriminator and allOf', () => {
        it('should handle variants that reference the parent via allOf', () => {
            const pet: OpenAPIV3.SchemaObject = {
                type: 'object',
                description: 'A pet in the store',
                discriminator: {
                    propertyName: 'petType',
                    mapping: {
                        dog: '#/components/schemas/Dog',
                        cat: '#/components/schemas/Cat',
                    },
                },
                oneOf: [],
                properties: {
                    name: { type: 'string' },
                    petType: { type: 'string' },
                },
                required: ['petType'],
            };

            const dog: OpenAPIV3.SchemaObject = {
                title: 'Dog',
                allOf: [pet, { type: 'object', properties: { barkVolume: { type: 'number' } } }],
            };

            const cat: OpenAPIV3.SchemaObject = {
                title: 'Cat',
                allOf: [pet],
                properties: { huntingSkill: { type: 'string' } },
            };

            pet.oneOf = [dog, cat];

            const result = getSchemaAlternatives(pet);

            expect(result?.type).toBe('oneOf');
            expect(result?.schemas).toHaveLength(2);

            const dogVariant = result?.schemas[0];
            expect(dogVariant?.title).toBe('Dog');
            expect(dogVariant?.properties).toHaveProperty('name');
            expect(dogVariant?.properties).toHaveProperty('petType');
            expect(dogVariant?.properties).toHaveProperty('barkVolume');
            expect(dogVariant).not.toHaveProperty('oneOf');
            expect(dogVariant).not.toHaveProperty('discriminator');
            expect(dogVariant).not.toHaveProperty('description');

            const catVariant = result?.schemas[1];
            expect(catVariant?.title).toBe('Cat');
            expect(catVariant?.properties).toHaveProperty('name');
            expect(catVariant?.properties).toHaveProperty('petType');
            expect(catVariant?.properties).toHaveProperty('huntingSkill');

            // Original schema must not be mutated
            expect(Object.keys(pet.properties ?? {})).toHaveLength(2);
            expect(pet.properties).not.toHaveProperty('barkVolume');
            expect(pet.properties).not.toHaveProperty('huntingSkill');
        });

        it('should handle dereferenced copies (different object, shared property refs)', () => {
            // After @scalar/openapi-parser dereference, $ref entries become new objects
            // with shallow-copied properties from the original (not the same JS reference).
            const pet: OpenAPIV3.SchemaObject = {
                type: 'object',
                description: 'A pet in the store',
                discriminator: {
                    propertyName: 'petType',
                    mapping: {
                        dog: '#/components/schemas/Dog',
                        cat: '#/components/schemas/Cat',
                    },
                },
                oneOf: [],
                properties: {
                    name: { type: 'string' },
                    petType: { type: 'string' },
                },
                required: ['petType'],
            };

            // Simulate dereference: $ref is replaced with a NEW object that has
            // the same property values (shared references) as the original.
            const petCopyForDog = { ...pet };
            const petCopyForCat = { ...pet };

            const dog: OpenAPIV3.SchemaObject = {
                title: 'Dog',
                allOf: [
                    petCopyForDog,
                    { type: 'object', properties: { barkVolume: { type: 'number' } } },
                ],
            };

            const cat: OpenAPIV3.SchemaObject = {
                title: 'Cat',
                allOf: [petCopyForCat],
                properties: { huntingSkill: { type: 'string' } },
            };

            pet.oneOf = [dog, cat];

            const result = getSchemaAlternatives(pet);

            expect(result?.type).toBe('oneOf');
            expect(result?.schemas).toHaveLength(2);

            const dogVariant = result?.schemas[0];
            expect(dogVariant?.title).toBe('Dog');
            expect(dogVariant?.properties).toHaveProperty('name');
            expect(dogVariant?.properties).toHaveProperty('petType');
            expect(dogVariant?.properties).toHaveProperty('barkVolume');
            expect(dogVariant).not.toHaveProperty('oneOf');
            expect(dogVariant).not.toHaveProperty('discriminator');
            expect(dogVariant).not.toHaveProperty('description');

            const catVariant = result?.schemas[1];
            expect(catVariant?.title).toBe('Cat');
            expect(catVariant?.properties).toHaveProperty('name');
            expect(catVariant?.properties).toHaveProperty('petType');
            expect(catVariant?.properties).toHaveProperty('huntingSkill');
            expect(catVariant).not.toHaveProperty('oneOf');
            expect(catVariant).not.toHaveProperty('discriminator');
            expect(catVariant).not.toHaveProperty('description');
        });
    });

    describe('integration: parse + dereference + getSchemaAlternatives', () => {
        it('should resolve polymorphic oneOf variants from a real spec', async () => {
            const spec = JSON.stringify({
                openapi: '3.0.1',
                info: { title: 'PetStore', version: '1.0' },
                paths: {},
                components: {
                    schemas: {
                        Pet: {
                            type: 'object',
                            description: 'A pet in the store',
                            discriminator: {
                                propertyName: 'petType',
                                mapping: {
                                    dog: '#/components/schemas/Dog',
                                    cat: '#/components/schemas/Cat',
                                },
                            },
                            oneOf: [
                                { $ref: '#/components/schemas/Dog' },
                                { $ref: '#/components/schemas/Cat' },
                            ],
                            properties: {
                                name: { type: 'string' },
                                petType: { type: 'string' },
                            },
                            required: ['petType'],
                        },
                        Dog: {
                            allOf: [
                                { $ref: '#/components/schemas/Pet' },
                                {
                                    type: 'object',
                                    properties: { barkVolume: { type: 'number' } },
                                },
                            ],
                        },
                        Cat: {
                            allOf: [{ $ref: '#/components/schemas/Pet' }],
                            properties: { huntingSkill: { type: 'string' } },
                        },
                    },
                },
            });

            const { filesystem } = await parseOpenAPI({
                value: spec,
                rootURL: 'memory://spec.json',
            });
            const doc = await dereferenceFilesystem(filesystem);
            const pet = doc.components?.schemas?.Pet as OpenAPIV3.SchemaObject;

            const result = getSchemaAlternatives(pet);

            expect(result?.type).toBe('oneOf');
            expect(result?.schemas).toHaveLength(2);

            const dogVariant = result?.schemas[0];
            expect(dogVariant?.title).toBe('Dog');
            expect(dogVariant?.properties).toHaveProperty('name');
            expect(dogVariant?.properties).toHaveProperty('petType');
            expect(dogVariant?.properties).toHaveProperty('barkVolume');
            expect(dogVariant).not.toHaveProperty('oneOf');
            expect(dogVariant).not.toHaveProperty('discriminator');
            expect(dogVariant).not.toHaveProperty('description');

            const catVariant = result?.schemas[1];
            expect(catVariant?.title).toBe('Cat');
            expect(catVariant?.properties).toHaveProperty('name');
            expect(catVariant?.properties).toHaveProperty('petType');
            expect(catVariant?.properties).toHaveProperty('huntingSkill');
            expect(catVariant).not.toHaveProperty('oneOf');
            expect(catVariant).not.toHaveProperty('discriminator');
            expect(catVariant).not.toHaveProperty('description');
        });
    });
});
