import { OpenAPIParseError } from './error';
import { convertOpenAPIV2ToOpenAPIV3 } from './v2';
import { parseOpenAPIV3 } from './v3';

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIParseError` if the document is invalid.
 */
export async function parseOpenAPI(input: { value: string; url: string }) {
    try {
        return await parseOpenAPIV3(input);
    } catch (error) {
        if (error instanceof OpenAPIParseError && error.code === 'v2-spec') {
            return convertOpenAPIV2ToOpenAPIV3(input);
        }
        throw error;
    }
}
