import type {
    Filesystem,
    OpenAPICustomSpecProperties,
    OpenAPISchema,
    OpenAPIV3xDocument,
} from '@gitbook/openapi-parser';
import { filterSelectedOpenAPISchemas } from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from '../dereference';

export type OpenAPISchemasData = Pick<OpenAPICustomSpecProperties, 'x-expandAllModelSections'> & {
    schemas: OpenAPISchema[];
};

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

    const schemas = filterSelectedOpenAPISchemas(schema, selectedSchemas);

    if (schemas.length === 0) {
        return null;
    }

    return {
        schemas,
        'x-expandAllModelSections':
            typeof schema['x-expandAllModelSections'] === 'boolean'
                ? schema['x-expandAllModelSections']
                : undefined,
    };
}
