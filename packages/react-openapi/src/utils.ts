import type { AnyObject, OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';

export function checkIsReference(
    input: unknown
): input is OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject {
    return typeof input === 'object' && !!input && '$ref' in input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}

/**
 * Resolve the description of an object.
 */
export function resolveDescription(object: OpenAPIV3.SchemaObject | AnyObject) {
    if ('items' in object && object.items) {
        return resolveDescription(object.items);
    }

    return 'x-gitbook-description-html' in object &&
        typeof object['x-gitbook-description-html'] === 'string'
        ? object['x-gitbook-description-html'].trim()
        : typeof object.description === 'string'
          ? object.description.trim()
          : undefined;
}

/**
 * Extract descriptions from an object.
 */
export function extractDescriptions(object: AnyObject) {
    return {
        description: object.description,
        'x-gitbook-description-html':
            'x-gitbook-description-html' in object
                ? object['x-gitbook-description-html']
                : undefined,
    };
}

/**
 * Resolve the first example from an object.
 */
export function resolveFirstExample(object: AnyObject) {
    if ('examples' in object && typeof object.examples === 'object' && object.examples) {
        const keys = Object.keys(object.examples);
        const firstKey = keys[0];
        if (firstKey && object.examples[firstKey]) {
            return object.examples[firstKey];
        }
    }
    if ('example' in object && object.example !== undefined) {
        return object.example;
    }
    return undefined;
}

/**
 * Resolve the schema of a parameter.
 * Extract the description, example and deprecated from parameter.
 */
export function resolveParameterSchema(
    parameter: OpenAPIV3.ParameterBaseObject
): OpenAPIV3.SchemaObject {
    const schema = checkIsReference(parameter.schema) ? undefined : parameter.schema;
    return {
        // Description of the parameter is defined at the parameter level
        // we use display it if the schema doesn't override it
        ...extractDescriptions(parameter),
        example: resolveFirstExample(parameter),
        // Deprecated can be defined at the parameter level
        deprecated: parameter.deprecated,
        ...schema,
    };
}

/**
 * Transform a parameter object to a property object.
 */
export function parameterToProperty(
    parameter: OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject
): {
    propertyName: string | undefined;
    schema: OpenAPIV3.SchemaObject;
    required: boolean | undefined;
} {
    if (checkIsReference(parameter)) {
        return {
            propertyName: parameter.$ref ?? 'Unknown ref',
            schema: {},
            required: undefined,
        };
    }
    return {
        propertyName: parameter.name,
        schema: resolveParameterSchema(parameter),
        required: parameter.required,
    };
}
