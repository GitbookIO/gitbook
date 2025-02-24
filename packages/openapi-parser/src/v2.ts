import { OpenAPIParseError } from './error';
import { upgrade } from '@scalar/openapi-parser';
import type { Filesystem, OpenAPIV3xDocument } from './types';
import { createFileSystem } from './filesystem';
import { ParseOpenAPIInput } from './parse';

/**
 * Convert a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 */
export async function convertOpenAPIV2ToOpenAPIV3(
    input: ParseOpenAPIInput,
): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, rootURL } = input;
    try {
        const result = upgrade(value);
        return createFileSystem({ value: result, rootURL });
    } catch (error) {
        throw new OpenAPIParseError('Failed to convert Swagger 2.0 to OpenAPI 3.0', {
            code: 'v2-conversion',
            rootURL,
            // @ts-expect-error
            cause: error,
        });
    }
}
