import { OpenAPIV3 } from '@scalar/openapi-types';

export function noReference<T>(input: T | OpenAPIV3.ReferenceObject): T {
    if (checkIsReference(input)) {
        throw new Error('Reference found');
    }

    return input;
}

export function checkIsReference(input: unknown): input is OpenAPIV3.ReferenceObject {
    return typeof input === 'object' && !!input && '$ref' in input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}
