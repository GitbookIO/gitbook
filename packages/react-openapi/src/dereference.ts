import {
    type Filesystem,
    type OpenAPIV3,
    type OpenAPIV3xDocument,
    dereference,
} from '@gitbook/openapi-parser';

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
    // Set default titles BEFORE dereferencing so they propagate through $ref resolution.
    // This is idempotent and only adds titles to schemas that don't already have one.
    setDefaultSchemaTitles(filesystem);

    const result = await dereference(filesystem);

    if (!result.schema) {
        throw new Error('Failed to dereference OpenAPI document');
    }

    return result.schema as OpenAPIV3xDocument;
}

/**
 * Default schema titles to their component name for discriminator value resolution.
 * Must run before dereference so titles propagate through $ref resolution.
 */
function setDefaultSchemaTitles(filesystem: Filesystem): void {
    const entrypoint = filesystem.find((f) => f.isEntrypoint);
    const schemas = entrypoint?.specification?.components?.schemas as Record<
        string,
        OpenAPIV3.SchemaObject
    >;

    if (!schemas || typeof schemas !== 'object') {
        return;
    }

    const entries = Object.entries(schemas);

    for (const [name, schema] of entries) {
        if (!schema.$ref && !schema.title) {
            schema.title = name;
        }
    }
}
