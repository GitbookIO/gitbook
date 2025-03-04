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
        ).toEqual([
            {
                type: 'number',
            },
            {
                type: 'boolean',
            },
            {
                type: 'string',
            },
        ]);
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
        ).toEqual([
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
        ]);
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

        expect(getSchemaAlternatives(a)).toEqual([
            {
                type: 'string',
            },
            a,
        ]);
    });
});
