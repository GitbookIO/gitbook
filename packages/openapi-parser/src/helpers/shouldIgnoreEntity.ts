import type { OpenAPIV3 } from '@scalar/openapi-types';

/**
 * Check if an entity should be ignored
 */
export function shouldIgnoreEntity(
    data:
        | undefined
        | Pick<OpenAPIV3.TagObject, 'x-internal' | 'x-gitbook-ignore'>
        | Pick<OpenAPIV3.OperationObject, 'x-internal' | 'x-gitbook-ignore'>
) {
    return data?.['x-internal'] === true || data?.['x-gitbook-ignore'] === true;
}
