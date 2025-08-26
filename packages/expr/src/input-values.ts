import type { JSONSchema7 } from 'json-schema';
import { filterOutNullable } from './utils';

type InputValuesType =
    | null
    | string
    | number
    | boolean
    | { [key: string]: InputValuesType }
    | InputValuesType[];

/**
 * Infers a default inputValues object based on the JSON schema of an object.
 */
export function inferDefaultInputValuesFromObjectJSONSchema(
    schema: JSONSchema7
): Record<string, InputValuesType> {
    if (schema.type !== 'object' || !schema.properties) {
        throw new Error(`Expected schema of object to be provided: ${schema.type}`);
    }

    const result: Record<string, InputValuesType> = {};

    for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (typeof propertySchema === 'boolean') {
            continue;
        }

        result[key] = inferDefaultInputValueFromJSONSchema(propertySchema);
    }

    return result;
}

function inferDefaultInputValueFromJSONSchema(schema: JSONSchema7): InputValuesType {
    switch (schema.type) {
        case 'object':
            return inferDefaultInputValuesFromObjectJSONSchema(schema);
        case 'array': {
            if (schema.items && Array.isArray(schema.items)) {
                return schema.items.map((itemSchema) => {
                    if (typeof itemSchema === 'boolean') {
                        return false;
                    }
                    return inferDefaultInputValueFromJSONSchema(itemSchema);
                });
            }
            return [];
        }
        case 'string':
        case 'number':
        case 'integer':
        case 'boolean':
        case 'null':
            return inferDefaultInputValueFromPrimitive(schema);
        default:
            throw new Error(`Unsupported schema type: ${schema.type}`);
    }
}

function inferDefaultInputValueFromPrimitive(schema: JSONSchema7): InputValuesType {
    switch (schema.type) {
        case 'boolean':
            return true;
        case 'number':
        case 'integer':
            return 1234;
        case 'string': {
            const enumValues = schema.enum?.filter(filterOutNullable);
            return enumValues?.[0] ?? 'default';
        }
        case 'null':
            return null;
        default:
            throw new Error(`Unsupported schema type: ${schema.type}`);
    }
}
