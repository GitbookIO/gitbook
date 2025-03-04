import { fromJSON, toJSON } from 'flatted';

import {
    type Filesystem,
    type OpenAPIV3,
    type OpenAPIV3_1,
    type OpenAPIV3xDocument,
    shouldIgnoreEntity,
} from '@gitbook/openapi-parser';
import { memoDereferenceFilesystem } from '../resolveOpenAPIOperation';
import type { OpenAPIModelsData } from '../types';

export { fromJSON, toJSON };

/**
 * Resolve an OpenAPI models from a file and compile it to a more usable format.
 * Models are extracted from the OpenAPI components.schemas
 */
export async function resolveOpenAPIModels(
    filesystem: Filesystem<OpenAPIV3xDocument>
    // operationDescriptor: {
    //     path: string;
    //     method: string;
    // }
): Promise<OpenAPIModelsData | null> {
    // const { path, method } = operationDescriptor;
    const schema = await memoDereferenceFilesystem(filesystem);

    if (
        !schema.components ||
        !schema.components.schemas ||
        !Object.keys(schema.components.schemas).length
    ) {
        return null;
    }

    let models: OpenAPIModelsData['models'] = [];

    models = getOpenAPIComponents(schema);

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
