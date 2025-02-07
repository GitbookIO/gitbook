import type { AnyObject, OpenAPIV3 } from '@gitbook/openapi-parser';

export function checkIsReference(input: unknown): input is OpenAPIV3.ReferenceObject {
    return typeof input === 'object' && !!input && '$ref' in input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}

/**
 * Resolve the description of an object.
 */
export function resolveDescription(object: AnyObject) {
    return 'x-description-html' in object && typeof object['x-description-html'] === 'string'
        ? object['x-description-html']
        : typeof object.description === 'string'
          ? object.description
          : undefined;
}
