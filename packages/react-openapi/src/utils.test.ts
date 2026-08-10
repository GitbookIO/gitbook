import { describe, expect, it } from 'bun:test';
import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import {
    extractNonNullTypes,
    getEffectiveArrayType,
    getSchemaTitle,
    normalizeNullableUnion,
} from './utils';

describe('getSchemaTitle', () => {
    it('should handle OpenAPI 3.1 nullable array with reference items', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                $ref: '#/components/schemas/ProductPayoutSplitDto',
            },
        };

        // Nullable is handled separately in getAdditionalItems, so type should not include | null
        expect(getSchemaTitle(schema)).toBe('ProductPayoutSplitDto[]');
    });

    it('should handle OpenAPI 3.1 nullable array with object items', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                type: 'string',
            },
        };

        // Nullable is handled separately in getAdditionalItems, so type should not include | null
        expect(getSchemaTitle(schema)).toBe('string[]');
    });

    it('should handle OpenAPI 3.0 nullable array (backward compatibility)', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: 'array',
            nullable: true,
            items: {
                $ref: '#/components/schemas/ProductPayoutSplitDto',
            },
        };

        expect(getSchemaTitle(schema)).toBe('ProductPayoutSplitDto[]');
    });

    it('should handle non-nullable array with reference items', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: 'array',
            items: {
                $ref: '#/components/schemas/ProductPayoutSplitDto',
            },
        };

        expect(getSchemaTitle(schema)).toBe('ProductPayoutSplitDto[]');
    });

    it('should handle nullable union types (non-array)', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'string'],
        };

        // Nullable is handled separately in getAdditionalItems, so type should not include | null
        expect(getSchemaTitle(schema)).toBe('string');
    });

    it('should handle multiple union types', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['string', 'number', 'null'],
        };

        // Nullable is handled separately in getAdditionalItems, so type should show non-null types only
        expect(getSchemaTitle(schema)).toBe('string | number');
    });

    it('should handle array with nested object items', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                    },
                },
            },
        };

        // Nullable is handled separately in getAdditionalItems
        expect(getSchemaTitle(schema)).toBe('object[]');
    });

    it('should handle array with primitive items', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                type: 'integer',
            },
        };

        // Nullable is handled separately in getAdditionalItems
        expect(getSchemaTitle(schema)).toBe('integer[]');
    });

    it('should handle the exact payout_splits use case', () => {
        // This matches the exact schema from the user's query
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                $ref: '#/components/schemas/ProductPayoutSplitDto',
            },
            description: 'The payout splits for revenue distribution.\nRequires special approval.',
        };

        // Nullable is handled separately in getAdditionalItems, so type should be ProductPayoutSplitDto[]
        expect(getSchemaTitle(schema)).toBe('ProductPayoutSplitDto[]');
    });
});

describe('getEffectiveArrayType', () => {
    it('should detect array in OpenAPI 3.1 union type', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['null', 'array'],
            items: {
                $ref: '#/components/schemas/ProductPayoutSplitDto',
            },
        };

        const result = getEffectiveArrayType(schema);
        expect(result.isArray).toBe(true);
        expect(result.hasNull).toBe(true);
        expect(result.items).toBeDefined();
    });

    it('should detect array without null', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: 'array',
            items: {
                type: 'string',
            },
        };

        const result = getEffectiveArrayType(schema);
        expect(result.isArray).toBe(true);
        expect(result.hasNull).toBe(false);
        expect(result.items).toBeDefined();
    });

    it('should return false for non-array types', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: 'string',
        };

        const result = getEffectiveArrayType(schema);
        expect(result.isArray).toBe(false);
        expect(result.hasNull).toBe(false);
    });

    it('should handle union type without array', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            type: ['string', 'number'],
        };

        const result = getEffectiveArrayType(schema);
        expect(result.isArray).toBe(false);
        expect(result.hasNull).toBe(false);
    });
});

describe('extractNonNullTypes', () => {
    it('should extract non-null types and detect null', () => {
        const result = extractNonNullTypes(['null', 'array', 'string']);
        expect(result.nonNullTypes).toEqual(['array', 'string']);
        expect(result.hasNull).toBe(true);
    });

    it('should handle types without null', () => {
        const result = extractNonNullTypes(['string', 'number']);
        expect(result.nonNullTypes).toEqual(['string', 'number']);
        expect(result.hasNull).toBe(false);
    });

    it('should handle only null', () => {
        const result = extractNonNullTypes(['null']);
        expect(result.nonNullTypes).toEqual([]);
        expect(result.hasNull).toBe(true);
    });
});

describe('normalizeNullableUnion', () => {
    it('should collapse anyOf with a single non-null member into a nullable schema', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            anyOf: [{ type: 'string' }, { type: 'null' }],
        };

        expect(normalizeNullableUnion(schema)).toEqual({ type: 'string', nullable: true });
    });

    it('should collapse oneOf with a single object member into a nullable object schema', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            oneOf: [
                {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                },
                { type: 'null' },
            ],
        };

        expect(normalizeNullableUnion(schema)).toEqual({
            type: 'object',
            properties: { id: { type: 'string' } },
            nullable: true,
        });
    });

    it('should handle a null member expressed as type: ["null"]', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            anyOf: [{ type: 'integer' }, { type: ['null'] }],
        };

        expect(normalizeNullableUnion(schema)).toEqual({ type: 'integer', nullable: true });
    });

    it('should keep the union (without null) and flag nullable for multiple non-null members', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
        };

        expect(normalizeNullableUnion(schema)).toEqual({
            anyOf: [{ type: 'string' }, { type: 'number' }],
            nullable: true,
        });
    });

    it('should preserve outer-level metadata over the collapsed member', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            description: 'Outer description',
            anyOf: [{ type: 'string', description: 'Member description' }, { type: 'null' }],
        };

        expect(normalizeNullableUnion(schema)).toEqual({
            type: 'string',
            description: 'Outer description',
            nullable: true,
        });
    });

    it('should return the schema unchanged when there is no null member', () => {
        const schema: OpenAPIV3.SchemaObject = {
            anyOf: [{ type: 'string' }, { type: 'number' }],
        };

        expect(normalizeNullableUnion(schema)).toBe(schema);
    });

    it('should return the schema unchanged when there is no union', () => {
        const schema: OpenAPIV3.SchemaObject = { type: 'string' };

        expect(normalizeNullableUnion(schema)).toBe(schema);
    });

    it('should keep a $ref member as a nullable union rather than inlining it', () => {
        const schema: OpenAPIV3_1.SchemaObject = {
            anyOf: [{ $ref: '#/components/schemas/Foo' }, { type: 'null' }],
        };

        expect(normalizeNullableUnion(schema)).toEqual({
            anyOf: [{ $ref: '#/components/schemas/Foo' }],
            nullable: true,
        });
    });
});
