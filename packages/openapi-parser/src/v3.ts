import { validate } from '@scalar/openapi-parser';

import { OpenAPIParseError } from './error';
import { createFileSystem } from './filesystem';
import type { ParseOpenAPIInput, ParseOpenAPIResult } from './parse';

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(input: ParseOpenAPIInput): Promise<ParseOpenAPIResult> {
    const { value, rootURL, options = {} } = input;

    const result = await validate(value).catch((error) => {
        throw new OpenAPIParseError('Invalid OpenAPI document', {
            code: 'invalid',
            rootURL,
            cause: error,
        });
    });

    // Ajv can't compile on Cloudflare Workers (no `new Function`), and Scalar then omits the version.
    const version =
        result.version ?? result.specification?.swagger ?? result.specification?.openapi;

    // If there is no version, we consider it invalid instantely.
    if (!version) {
        throw new OpenAPIParseError(
            'Can’t find supported Swagger/OpenAPI version in the provided document, version must be a string.',
            {
                code: 'invalid',
                rootURL,
                errors: result.errors,
            }
        );
    }

    // If the version is 2.0, we throw an error to trigger the upgrade.
    if (version === '2.0') {
        throw new OpenAPIParseError('Only OpenAPI v3 is supported', {
            code: 'parse-v2-in-v3',
            rootURL,
        });
    }

    // We don't rely on `result.invalid` because it's too strict.
    // If we succeed in parsing a schema, then we consider it valid.
    if (!result.specification) {
        throw new OpenAPIParseError('Invalid OpenAPI document', {
            code: 'invalid',
            rootURL,
            errors: result.errors,
        });
    }

    const filesystem = await createFileSystem({
        value: result.specification,
        rootURL,
        options,
    });

    return { filesystem, errors: result.errors ?? [] };
}
