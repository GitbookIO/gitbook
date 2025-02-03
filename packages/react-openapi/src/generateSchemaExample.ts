import { OpenAPIV3 } from '@scalar/openapi-types';
import { noReference } from './utils';
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
        omitEmptyAndOptionalProperties: options.onlyRequired,
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
