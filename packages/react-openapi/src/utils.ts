import type { AnyObject, OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import type { OpenAPIUniversalContext } from './context';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { tString } from './translate';
import type { OpenAPIOperationData, OpenAPISecuritySchemeWithRequired } from './types';

export function checkIsReference(input: unknown): input is OpenAPIV3.ReferenceObject {
    return typeof input === 'object' && !!input && '$ref' in input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}

/**
 * Check if an object has a description. Either at the root level or in items.
 */
function hasDescription(object: AnyObject) {
    return 'description' in object || 'x-gitbook-description-html' in object;
}

/**
 * Resolve the description of an object.
 */
export function resolveDescription(object: OpenAPIV3.SchemaObject | AnyObject) {
    // Resolve description from the object first
    if (hasDescription(object)) {
        return 'x-gitbook-description-html' in object &&
            typeof object['x-gitbook-description-html'] === 'string'
            ? object['x-gitbook-description-html'].trim()
            : typeof object.description === 'string'
              ? object.description.trim()
              : undefined;
    }

    // If the object has no description, try to resolve it from the items
    if ('items' in object && typeof object.items === 'object' && hasDescription(object.items)) {
        return resolveDescription(object.items);
    }

    return undefined;
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
export function resolveFirstExample(object: AnyObject): string | undefined {
    if ('examples' in object && typeof object.examples === 'object' && object.examples) {
        const keys = Object.keys(object.examples);
        const firstKey = keys[0];
        if (firstKey && object.examples[firstKey]) {
            return formatExample(object.examples[firstKey]);
        }
    }

    // Resolve top level example first
    if (shouldDisplayExample(object)) {
        return formatExample(object.example);
    }

    // Resolve example from items if it exists
    if (object.items && typeof object.items === 'object') {
        return formatExample(object.items.example);
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

/**
 * Format the example of a schema.
 */
function formatExample(example: unknown): string {
    if (typeof example === 'string') {
        return example
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces/newlines into a single space
            .replace(/([\{\}:,])\s+/g, '$1 ') // Ensure a space after {, }, :, and ,
            .replace(/\s+([\{\}:,])/g, ' $1') // Ensure a space before {, }, :, and ,
            .trim();
    }

    return stringifyOpenAPI(example);
}

/**
 * Check if an example should be displayed.
 */
function shouldDisplayExample(schema: OpenAPIV3.SchemaObject): boolean {
    return (
        (typeof schema.example === 'string' && !!schema.example) ||
        typeof schema.example === 'number' ||
        typeof schema.example === 'boolean' ||
        (Array.isArray(schema.example) && schema.example.length > 0) ||
        (typeof schema.example === 'object' &&
            schema.example !== null &&
            Object.keys(schema.example).length > 0)
    );
}

/**
 * Get the class name for a status code.
 * 1xx: informational
 * 2xx: success
 * 3xx: redirect
 * 4xx, 5xx: error
 */
export function getStatusCodeClassName(statusCode: number | string): string {
    const category = getStatusCodeCategory(statusCode);
    switch (category) {
        case 1:
            return 'informational';
        case 2:
            return 'success';
        case 3:
            return 'redirect';
        case 4:
        case 5:
            return 'error';
        default:
            return 'unknown';
    }
}

/**
 * Get a default label for a status code.
 * This is used when there is no label provided in the OpenAPI spec.
 * 1xx: Information
 * 2xx: Success
 * 3xx: Redirect
 * 4xx, 5xx: Error
 */
export function getStatusCodeDefaultLabel(
    statusCode: number | string,
    context: OpenAPIUniversalContext
): string {
    const category = getStatusCodeCategory(statusCode);
    switch (category) {
        case 1:
            return tString(context.translation, 'information');
        case 2:
            return tString(context.translation, 'success');
        case 3:
            return tString(context.translation, 'redirect');
        case 4:
        case 5:
            return tString(context.translation, 'error');
        default:
            return '';
    }
}

function getStatusCodeCategory(statusCode: number | string): number | string {
    const code = typeof statusCode === 'string' ? Number.parseInt(statusCode, 10) : statusCode;

    if (Number.isNaN(code) || code < 100 || code >= 600) {
        return 'unknown';
    }

    // Determine the category of the status code based on the first digit
    const category = Math.floor(code / 100);

    return category;
}

export function getSchemaTitle(schema: OpenAPIV3.SchemaObject): string {
    // Otherwise try to infer a nice title
    let type = 'any';

    if (schema.enum || schema['x-enumDescriptions'] || schema['x-gitbook-enum']) {
        type = `${schema.type} · enum`;
        // check array AND schema.items as this is sometimes null despite what the type indicates
    } else if (schema.type === 'array' && !!schema.items) {
        type = `${getSchemaTitle(schema.items)}[]`;
    } else if (Array.isArray(schema.type)) {
        type = schema.type.join(' | ');
    } else if (schema.type || schema.properties) {
        type = schema.type ?? 'object';

        if (schema.format) {
            type += ` · ${schema.format}`;
        }

        // Only add the title if it's an object (no need for the title of a string, number, etc.)
        if (type === 'object' && schema.title) {
            type += ` · ${schema.title.replaceAll(' ', '')}`;
        }
    }

    if ('anyOf' in schema) {
        type = 'any of';
    } else if ('oneOf' in schema) {
        type = 'one of';
    } else if ('allOf' in schema) {
        type = 'all of';
    } else if ('not' in schema) {
        type = 'not';
    }

    return type;
}

export type OperationSecurityInfo = {
    key: string;
    label: string;
    schemes: OpenAPISecuritySchemeWithRequired[];
};

/**
 * Extract security information for an operation based on its security requirements and the spec security schemes.
 */
export function extractOperationSecurityInfo(args: {
    securityRequirement: OpenAPIV3.OperationObject['security'];
    securities: OpenAPIOperationData['securities'];
}): OperationSecurityInfo[] {
    const { securityRequirement, securities } = args;
    const securitiesMap = new Map(securities);

    // When no security requirement include every schemes
    if (!securityRequirement || securityRequirement.length === 0) {
        return securities.map(([key, security]) => ({
            key,
            label: key,
            schemes: [security],
        }));
    }

    return securityRequirement.map((requirement, idx) => {
        const schemeKeys = Object.keys(requirement);

        return {
            key: `security-${idx}`,
            label: schemeKeys.join(' & '),
            schemes: schemeKeys
                .map((schemeKey) => securitiesMap.get(schemeKey))
                .filter((s) => s !== undefined),
        };
    });
}
