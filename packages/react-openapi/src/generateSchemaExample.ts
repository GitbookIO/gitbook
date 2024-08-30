import { OpenAPIV3 } from 'openapi-types';
import { noReference } from './utils';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

/**
 * Generate a JSON example from a schema
 */
export function generateSchemaExample(
    schema: OpenAPIV3.SchemaObject,
    options: {
        onlyRequired?: boolean;
    } = {},
    ancestors: Set<OpenAPIV3.SchemaObject> = new Set(),
): JSONValue | undefined {
    const { onlyRequired = false } = options;

    if (ancestors.has(schema)) {
        return undefined;
    }

    if (typeof schema.example !== 'undefined') {
        return schema.example;
    }

    if (schema.enum && schema.enum.length > 0) {
        return schema.enum[0];
    }

    if (schema.type === 'string') {
        if (schema.default) {
            return schema.default;
        }

        if (schema.format === 'date-time') {
            return new Date().toISOString();
        }

        if (schema.format === 'date') {
            return new Date().toISOString().split('T')[0];
        }

        if (schema.format === 'email') {
            return 'name@gmail.com';
        }

        if (schema.format === 'hostname') {
            return 'example.com';
        }

        if (schema.format === 'ipv4') {
            return '0.0.0.0';
        }

        if (schema.format === 'ipv6') {
            return '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
        }

        if (schema.format === 'uri') {
            return 'https://example.com';
        }

        if (schema.format === 'uuid') {
            return '123e4567-e89b-12d3-a456-426614174000';
        }

        if (schema.format === 'binary') {
            return 'binary';
        }

        if (schema.format === 'byte') {
            return 'Ynl0ZXM=';
        }

        if (schema.format === 'password') {
            return 'password';
        }

        return 'text';
    }

    if (schema.type === 'number') {
        return schema.default || 0;
    }

    if (schema.type === 'boolean') {
        return schema.default || false;
    }

    if (schema.type === 'array') {
        if (schema.items) {
            const exampleValue = generateSchemaExample(
                noReference(schema.items),
                options,
                new Set(ancestors).add(schema),
            );
            if (exampleValue !== undefined) {
                return [exampleValue];
            }
            return [];
        }
        return [];
    }

    if (schema.properties) {
        const example: { [key: string]: JSONValue } = {};
        const props = onlyRequired ? (schema.required ?? []) : Object.keys(schema.properties);

        for (const key of props) {
            const property = noReference(schema.properties[key]);
            if (property && (onlyRequired || !property.deprecated)) {
                const exampleValue = generateSchemaExample(
                    noReference(property),
                    options,
                    new Set(ancestors).add(schema),
                );

                if (exampleValue !== undefined) {
                    example[key] = exampleValue;
                }
            }
        }
        return example;
    }

    if (schema.oneOf && schema.oneOf.length > 0) {
        return generateSchemaExample(
            noReference(schema.oneOf[0]),
            options,
            new Set(ancestors).add(schema),
        );
    }

    if (schema.anyOf && schema.anyOf.length > 0) {
        return generateSchemaExample(
            noReference(schema.anyOf[0]),
            options,
            new Set(ancestors).add(schema),
        );
    }
    const filteredAllOf = schema.allOf && schema.allOf.filter(item => item !== undefined)
    if (filteredAllOf && filteredAllOf.length > 0) {
        return filteredAllOf.reduce(
            (acc, curr) => {
                const example = generateSchemaExample(
                    noReference(curr),
                    options,
                    new Set(ancestors).add(schema),
                );

                if (typeof example === 'object' && !Array.isArray(example) && example !== null) {
                    return { ...acc, ...example };
                }

                return acc;
            },
            {} as { [key: string]: JSONValue },
        );
    }

    return undefined;
}

/**
 * Generate an example for a media type.
 */
export function generateMediaTypeExample(
    mediaType: OpenAPIV3.MediaTypeObject,
    options: {
        onlyRequired?: boolean;
    } = {},
): JSONValue | undefined {
    if (mediaType.example) {
        return mediaType.example;
    }

    if (mediaType.examples) {
        const example = mediaType.examples[Object.keys(mediaType.examples)[0]];
        if (example) {
            return noReference(example).value;
        }
    }

    if (mediaType.schema) {
        return generateSchemaExample(noReference(mediaType.schema), options);
    }

    return undefined;
}
