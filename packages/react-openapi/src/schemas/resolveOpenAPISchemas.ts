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

// Hosts that pre-render the heading must reach the same answer as `OpenAPISchemas`, so both read it
// from here rather than duplicating the condition.
export function getSchemasHeading(
    data: OpenAPISchemasData,
    grouped: boolean | undefined
): { title: string; deprecated: boolean; stability?: string } | null {
    const firstSchema = data.schemas[0];
    if (!firstSchema || data.schemas.length !== 1 || grouped) {
        return null;
    }

    return {
        title: `The ${firstSchema.name} object`,
        deprecated: Boolean(firstSchema.schema.deprecated),
        stability: firstSchema.schema['x-stability'],
    };
}

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
