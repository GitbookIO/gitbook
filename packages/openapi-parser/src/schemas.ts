import type { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { shouldIgnoreEntity } from './helpers/shouldIgnoreEntity';
import type { OpenAPISchema } from './types';

/**
 * Build a stable, readable anchor id for a model/schema name (e.g. `User` -> `user`).
 * Shared between the rendered disclosure and the page's table of contents so their ids match.
 * Names are usually unique within a spec; a page heading could in theory slug to the same value.
 */
export function getOpenAPISchemaAnchorId(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

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
