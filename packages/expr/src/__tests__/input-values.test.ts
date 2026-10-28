import { describe, expect, it } from 'bun:test';

import { inferDefaultInputValuesFromObjectJSONSchema } from '../input-values';

describe('inferDefaultInputValuesFromObjectJSONSchema', () => {
    it('should infer properly the default input value based on the JSON schema of an object', () => {
        const defaultInputValues = inferDefaultInputValuesFromObjectJSONSchema({
            type: 'object',
            properties: {
                claims: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                        },
                        flags: {
                            type: 'object',
                            properties: {
                                FLAG1: { type: 'string' },
                                FLAG2: { type: 'string' },
                                FLAG3: { type: 'string' },
                            },
                        },
                        isAlphaUser: {
                            type: 'boolean',
                        },
                        hello: {
                            type: 'string',
                            enum: ['enumValue1', 'enumValue2', 'enumValue3'],
                        },
                    },
                },
            },
        });
        expect(defaultInputValues).toMatchObject({
            claims: {
                key: 'default',
                flags: {
                    FLAG1: 'default',
                    FLAG2: 'default',
                    FLAG3: 'default',
                },
                isAlphaUser: true,
                hello: 'enumValue1',
            },
        });
    });
});
