import { OpenAPICustomSpecProperties } from './types';
import { AnyApiDefinitionFormat, validate } from '@scalar/openapi-parser';
import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { OpenAPIParseError } from './error';
import { parseDescriptions } from './markdown';

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(input: {
    value: AnyApiDefinitionFormat;
    url: string;
    parseMarkdown: (input: string) => Promise<string>;
}): Promise<
    | OpenAPIV3.Document<OpenAPICustomSpecProperties>
    | OpenAPIV3_1.Document<OpenAPICustomSpecProperties>
> {
    const { value, url } = input;
    const result = await validate(value);

    // Spec is invalid, we stop here.
    if (!result.specification) {
        throw new OpenAPIParseError('Invalid OpenAPI document', url, 'invalid-spec');
    }

    if (result.version === '2.0') {
        throw new OpenAPIParseError('Only OpenAPI v3 is supported', url, 'v2-spec');
    }

    const specification = await parseDescriptions({
        specification: result.specification,
        parseMarkdown: input.parseMarkdown,
    });

    switch (result.version) {
        case '3.0':
            return specification as OpenAPIV3.Document<OpenAPICustomSpecProperties>;
        case '3.1':
        default:
            return specification as OpenAPIV3_1.Document<OpenAPICustomSpecProperties>;
    }
}
