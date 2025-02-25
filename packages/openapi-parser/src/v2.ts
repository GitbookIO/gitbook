import { OpenAPIParseError } from './error';
import { parseOpenAPIV3 } from './v3';
import type { AnyApiDefinitionFormat } from '@scalar/openapi-parser';
import type { Filesystem, OpenAPIV3xDocument } from './types';
import { upgrade } from '@scalar/openapi-parser';

/**
 * Convert a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 */
export async function convertOpenAPIV2ToOpenAPIV3(input: {
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
