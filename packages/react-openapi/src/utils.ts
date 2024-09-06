import { OpenAPIV3 } from 'openapi-types';

export function noReference<T>(input: T | OpenAPIV3.ReferenceObject): T {
    if (typeof input === 'object' && !!input && '$ref' in input) {
        throw new Error('Reference found');
    }

    return input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}
