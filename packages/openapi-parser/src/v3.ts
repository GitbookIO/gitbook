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
    /**
     * The API definition to parse.
     */
    value: AnyApiDefinitionFormat;
    /**
     * The root URL of the specified OpenAPI document.
     */
    rootURL: string | null;
}): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, rootURL } = input;

    try {
        const result = await validate(value);
        // Spec is invalid, we stop here.
        if (!result.specification) {
            throw new OpenAPIParseError('Invalid OpenAPI document', {
                code: 'invalid',
                rootURL,
            });
        }

        if (result.version === '2.0') {
            throw new OpenAPIParseError('Only OpenAPI v3 is supported', {
                code: 'parse-v2-in-v3',
                rootURL,
            });
        }

        const filesystem = await createFileSystem({ value: result.specification, rootURL });

        return filesystem;
    } catch (err) {
        console.error(err);
        console.trace();
        throw err;
    }
}
