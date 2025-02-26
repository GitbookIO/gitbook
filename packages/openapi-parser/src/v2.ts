import { upgrade } from '@scalar/openapi-parser';
import { OpenAPIParseError } from './error';
import type { ParseOpenAPIInput } from './parse';
import type { Filesystem, OpenAPIV3xDocument } from './types';
import { parseOpenAPIV3 } from './v3';

/**
 * Convert a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 */
export async function convertOpenAPIV2ToOpenAPIV3(
    input: ParseOpenAPIInput
): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, rootURL } = input;

    const upgradeResult = (() => {
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
    })();

    return parseOpenAPIV3({ ...input, rootURL, value: upgradeResult.specification });
}
