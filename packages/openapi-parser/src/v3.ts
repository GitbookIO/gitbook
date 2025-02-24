import { validate } from '@scalar/openapi-parser';
import { OpenAPIParseError } from './error';
import { createFileSystem } from './filesystem';
import type { Filesystem, OpenAPIV3xDocument } from './types';
import type { ParseOpenAPIInput } from './parse';

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(
    input: ParseOpenAPIInput,
): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, rootURL, trust } = input;
    const specification = trust
        ? trustedValidate({ value, rootURL })
        : await untrustedValidate({ value, rootURL });

    const filesystem = await createFileSystem({ value: specification, rootURL });

    return filesystem;
}

type ValidateOpenAPIV3Input = Pick<ParseOpenAPIInput, 'value' | 'rootURL'>;

/**
 * Validate an untrusted OpenAPI v3 document.
 */
async function untrustedValidate(input: ValidateOpenAPIV3Input) {
    const { value, rootURL } = input;
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

    return result.specification;
}

/**
 * Validate a trusted OpenAPI v3 document.
 * It assumes the specification is already a valid specification.
 * It's faster than `untrustedValidate`.
 */
function trustedValidate(input: ValidateOpenAPIV3Input) {
    const { value, rootURL } = input;
    const result = (() => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (error) {
                throw new OpenAPIParseError('Invalid JSON', {
                    code: 'invalid',
                    rootURL,
                });
            }
        }
        return value;
    })();

    if ('swagger' in result && result.swagger) {
        throw new OpenAPIParseError('Only OpenAPI v3 is supported', {
            code: 'parse-v2-in-v3',
            rootURL,
        });
    }

    return result;
}
