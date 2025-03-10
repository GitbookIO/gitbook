import {
    type Filesystem,
    type OpenAPIV3,
    type OpenAPIV3_1,
    type OpenAPIV3xDocument,
    shouldIgnoreEntity,
} from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from '../dereference';
import type { OpenAPISchema, OpenAPISchemasData } from '../types';

//!!TODO: We should return only the schemas that are used in the block. Still a WIP awaiting future work.

/**
 * Resolve an OpenAPI schemas from a file and compile it to a more usable format.
 * Schemas are extracted from the OpenAPI components.schemas
 */
export async function resolveOpenAPISchemas(
    filesystem: Filesystem<OpenAPIV3xDocument>,
    options: {
        schemas: string[];
    }
): Promise<OpenAPISchemasData | null> {
    const { schemas: selectedSchemas } = options;

    const schema = await dereferenceFilesystem(filesystem);

    const schemas = getOpenAPIComponents(schema, selectedSchemas);

    if (schemas.length === 0) {
        return null;
    }

    return { schemas };
}

/**
 * Get OpenAPI components.schemas that are not ignored.
 */
function getOpenAPIComponents(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    selectedSchemas: string[]
): OpenAPISchema[] {
    const schemas = schema.components?.schemas ?? {};
    return Object.entries(schemas)
        .filter(([key]) => selectedSchemas.includes(key))
        .filter(([, schema]) => !shouldIgnoreEntity(schema))
        .map(([key, schema]) => ({ name: key, schema }));
}
