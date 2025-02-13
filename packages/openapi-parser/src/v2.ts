import YAML from 'yaml';
import swagger2openapi, { type ConvertOutputOptions } from 'swagger2openapi';

import { OpenAPIParseError } from './error';
import { parseOpenAPIV3 } from './v3';
import type { AnyApiDefinitionFormat } from '@scalar/openapi-parser';
import type { Filesystem, OpenAPIV3xDocument } from './types';

/**
 * Convert a Swagger 2.0 schema to an OpenAPI 3.0 schema.
 */
export async function convertOpenAPIV2ToOpenAPIV3(input: {
    value: AnyApiDefinitionFormat;
    url: string;
}): Promise<Filesystem<OpenAPIV3xDocument>> {
    const { value, url } = input;
    // In this case we want the raw value to be able to convert it.
    const schema = typeof value === 'string' ? rawParseOpenAPI({ value, url }) : value;
    try {
        // @ts-expect-error Types are incompatible between the two libraries
        const convertResult = (await swagger2openapi.convertObj(schema, {
            resolve: false,
            resolveInternal: false,
            laxDefaults: true,
            laxurls: true,
            lint: false,
            prevalidate: false,
            anchors: true,
            patch: true,
        })) as ConvertOutputOptions;

        return parseOpenAPIV3({ url, value: convertResult.openapi });
    } catch (error) {
        if (error instanceof Error && error.name === 'S2OError') {
            throw new OpenAPIParseError(
                'Failed to convert Swagger 2.0 to OpenAPI 3.0: ' + (error as Error).message,
                url,
            );
        } else {
            throw error;
        }
    }
}

/**
 * Parse the config file from a raw string.
 * Useful to get the raw object from a file.
 */
function rawParseOpenAPI(input: { value: string; url: string }): unknown {
    const { value, url } = input;

    // Try with JSON
    try {
        return JSON.parse(value);
    } catch (jsonError) {
        try {
            // Try with YAML
            return YAML.parse(value);
        } catch (yamlError) {
            if (yamlError instanceof Error && yamlError.name.startsWith('YAML')) {
                throw new OpenAPIParseError('Failed to parse YAML: ' + yamlError.message, url);
            }
            throw yamlError;
        }
    }
}
