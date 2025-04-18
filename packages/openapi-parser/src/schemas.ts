import type { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { shouldIgnoreEntity } from './helpers/shouldIgnoreEntity';
import type { OpenAPISchema } from './types';

/**
 * Extract selected schemas from the OpenAPI document.
 */
export function filterSelectedOpenAPISchemas(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    selectedSchemas: string[]
): OpenAPISchema[] {
    const componentsSchemas = schema.components?.schemas ?? {};

    // Preserve the order of the selected schemas
    return selectedSchemas
        .map((name) => {
            const schema = componentsSchemas[name];
            if (schema && !shouldIgnoreEntity(schema)) {
                return {
                    name,
                    schema,
                };
            }
            return null;
        })
        .filter((schema): schema is OpenAPISchema => !!schema);
}
