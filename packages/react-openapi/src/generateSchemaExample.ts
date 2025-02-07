import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { getExampleFromSchema } from '@scalar/oas-utils/spec-getters';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

/**
 * Generate a JSON example from a schema
 */
export function generateSchemaExample(
    schema: OpenAPIV3.SchemaObject,
    options: {
        onlyRequired?: boolean;
    } = {},
): JSONValue | undefined {
    return getExampleFromSchema(schema, {
        emptyString: 'text',
        omitEmptyAndOptionalProperties: options.onlyRequired,
        variables: {
            'date-time': new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            email: 'name@gmail.com',
            hostname: 'example.com',
            ipv4: '0.0.0.0',
            ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
            uri: 'https://example.com',
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            binary: 'binary',
            byte: 'Ynl0ZXM=',
            password: 'password',
        },
    });
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
        const key = Object.keys(mediaType.examples)[0];
        if (key) {
            const example = mediaType.examples[key];
            if (example) {
                return example.value;
            }
        }
    }

    if (mediaType.schema) {
        return generateSchemaExample(mediaType.schema, options);
    }

    return undefined;
}
