import type { OpenAPIV3 } from '@scalar/openapi-types';

/**
 * Check if an entity should be ignored
 */
export function shouldIgnoreEntity(
    data: undefined | OpenAPIV3.TagObject | OpenAPIV3.OperationObject
) {
    return data?.['x-internal'] === true || data?.['x-gitbook-ignore'] === true;
}
