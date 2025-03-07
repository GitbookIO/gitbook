import { type Filesystem, type OpenAPIV3xDocument, dereference } from '@gitbook/openapi-parser';

const dereferenceCache = new WeakMap<Filesystem, Promise<OpenAPIV3xDocument>>();

/**
 * Memoized version of `dereferenceSchema`.
 */
export function dereferenceFilesystem(filesystem: Filesystem): Promise<OpenAPIV3xDocument> {
    if (dereferenceCache.has(filesystem)) {
        return dereferenceCache.get(filesystem) as Promise<OpenAPIV3xDocument>;
    }

    const promise = baseDereferenceFilesystem(filesystem);
    dereferenceCache.set(filesystem, promise);
    return promise;
}

/**
 * Dereference an OpenAPI schema.
 */
async function baseDereferenceFilesystem(filesystem: Filesystem): Promise<OpenAPIV3xDocument> {
    const result = await dereference(filesystem);

    if (!result.schema) {
        throw new Error('Failed to dereference OpenAPI document');
    }

    return result.schema as OpenAPIV3xDocument;
}
