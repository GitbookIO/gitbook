import { type AnyApiDefinitionFormat, validate } from '@scalar/openapi-parser';
import { OpenAPIParseError } from './error';
import { createFileSystem } from './filesystem';
import type { Filesystem, OpenAPIV3xDocument } from './types';

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(input: {
    value: AnyApiDefinitionFormat;
    url: string;
}): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, url } = input;
    const result = await validate(value);

    // Spec is invalid, we stop here.
    if (!result.specification) {
        throw new OpenAPIParseError('Invalid OpenAPI document', url, 'invalid-spec');
    }

    if (result.version === '2.0') {
        throw new OpenAPIParseError('Only OpenAPI v3 is supported', url, 'v2-spec');
    }

    const filesystem = await createFileSystem({ value: result.specification, baseUrl: url });

    return filesystem;
}
