import type { AnyApiDefinitionFormat, LoadPlugin } from '@scalar/openapi-parser';
import { OpenAPIParseError } from './error';
import { convertOpenAPIV2ToOpenAPIV3 } from './v2';
import { parseOpenAPIV3 } from './v3';

export interface ParseOpenAPIInput {
    /**
     * The API definition to parse.
     */
    value: AnyApiDefinitionFormat;
    /**
     * The root URL of the specified OpenAPI document.
     */
    rootURL: string | null;
    /**
     * Trust the input. This will skip advanced validation.
     */
    trust?: boolean;
    /**
     * Options for the parser.
     */
    options?: {
        plugins?: LoadPlugin[];
    };
}

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIParseError` if the document is invalid.
 */
export async function parseOpenAPI(input: ParseOpenAPIInput) {
    try {
        return await parseOpenAPIV3(input);
    } catch (error) {
        if (error instanceof OpenAPIParseError && error.code === 'parse-v2-in-v3') {
            return convertOpenAPIV2ToOpenAPIV3(input);
        }
        throw error;
    }
}
