import type { Filesystem, OpenAPISchema, OpenAPIV3xDocument } from '@gitbook/openapi-parser';
import { filterSelectedOpenAPISchemas } from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from '../dereference';

/**
 * Resolve an OpenAPI schemas from a file and compile it to a more usable format.
 * Schemas are extracted from the OpenAPI components.schemas
 */
export async function resolveOpenAPISchemas(
    filesystem: Filesystem<OpenAPIV3xDocument>,
    options: {
        schemas: string[];
    }
): Promise<{
    schemas: OpenAPISchema[];
} | null> {
    const { schemas: selectedSchemas } = options;

    const schema = await dereferenceFilesystem(filesystem);

    const schemas = filterSelectedOpenAPISchemas(schema, selectedSchemas);

    if (schemas.length === 0) {
        return null;
    }

    return { schemas };
}
