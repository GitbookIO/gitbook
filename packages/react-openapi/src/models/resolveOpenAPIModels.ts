import {
    type Filesystem,
    type OpenAPIV3,
    type OpenAPIV3_1,
    type OpenAPIV3xDocument,
    shouldIgnoreEntity,
} from '@gitbook/openapi-parser';
import { memoDereferenceFilesystem } from '../memoDereferenceFilesystem';
import type { OpenAPIModelsData } from '../types';

//!!TODO: We should return only the models that are used in the block. Still a WIP awaiting future work.

/**
 * Resolve an OpenAPI models from a file and compile it to a more usable format.
 * Models are extracted from the OpenAPI components.schemas
 */
export async function resolveOpenAPIModels(
    filesystem: Filesystem<OpenAPIV3xDocument>
): Promise<OpenAPIModelsData | null> {
    const schema = await memoDereferenceFilesystem(filesystem);

    const models = getOpenAPIComponents(schema);

    return { models };
}

/**
 * Get OpenAPI components.schemas that are not ignored.
 */
function getOpenAPIComponents(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document
): [string, OpenAPIV3.SchemaObject][] {
    const schemas = schema.components?.schemas ?? {};
    return Object.entries(schemas).filter(([, schema]) => !shouldIgnoreEntity(schema));
}
