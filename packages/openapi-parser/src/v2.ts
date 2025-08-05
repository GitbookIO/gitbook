import { upgrade } from '@scalar/openapi-parser';
import { OpenAPIParseError } from './error';
import type { ParseOpenAPIInput, ParseOpenAPIResult } from './parse';
import { parseOpenAPIV3 } from './v3';

/**
 * Convert a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 */
export async function convertOpenAPIV2ToOpenAPIV3(
    input: ParseOpenAPIInput
): Promise<ParseOpenAPIResult> {
    const result = upgradeFromInput(input);
    return parseOpenAPIV3({ ...input, rootURL: input.rootURL, value: result.specification });
}

/**
 * Upgrade a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 * This function will throw an error if the conversion fails.
 */
function upgradeFromInput(input: ParseOpenAPIInput) {
    const { value, rootURL } = input;
    try {
        return upgrade(value);
    } catch (error) {
        if (error instanceof Error) {
            throw new OpenAPIParseError('Failed to convert Swagger 2.0 to OpenAPI 3.1.1', {
                code: 'v2-conversion',
                rootURL,
                cause: error,
            });
        }

        throw error;
    }
}
