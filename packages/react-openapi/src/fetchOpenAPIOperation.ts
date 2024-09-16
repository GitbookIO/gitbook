import { toJSON, fromJSON } from 'flatted';
import { OpenAPIV3 } from 'openapi-types';
import YAML from 'yaml';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';

import { resolveOpenAPIPath } from './resolveOpenAPIPath';
import { OpenAPIFetcher } from './types';

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject & OpenAPICustomOperationProperties;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3.SecuritySchemeObject][];
}

/**
 * Custom properties that can be defined at the entire spec level.
 */
export interface OpenAPICustomSpecProperties {
    /**
     * If `true`, code samples will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-codeSamples'?: boolean;

    /**
     * If `true`, the "Try it" button will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom properties that can be defined at the operation level.
 * These properties are not part of the OpenAPI spec.
 */
export interface OpenAPICustomOperationProperties {
    'x-code-samples'?: OpenAPICustomCodeSample[];
    'x-codeSamples'?: OpenAPICustomCodeSample[] | false;
    'x-custom-examples'?: OpenAPICustomCodeSample[];

    /**
     * If `true`, the "Try it" button will not be displayed.
     * https://redocly.com/docs/api-reference-docs/specification-extensions/x-hidetryitpanel/
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom code samples that can be defined at the operation level.
 * It follows the spec defined by Redocly.
 * https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
 */
export interface OpenAPICustomCodeSample {
    lang: string;
    label: string;
    source: string;
}

export { toJSON, fromJSON };

/**
 * Resolve an OpenAPI operation in a file and compile it to a more usable format.
 */
export async function fetchOpenAPIOperation(
    input: {
        url: string;
        path: string;
        method: string;
    },
    rawFetcher: OpenAPIFetcher,
): Promise<OpenAPIOperationData | null> {
    const fetcher = cacheFetcher(rawFetcher);

    let operation = await resolveOpenAPIPath<OpenAPIV3.OperationObject>(
        input.url,
        ['paths', input.path, input.method],
        fetcher,
    );

    if (!operation) {
        return null;
    }

    const specData = await fetcher.fetch(input.url);

    // Resolve common parameters
    const commonParameters = await resolveOpenAPIPath<OpenAPIV3.ParameterObject[]>(
        input.url,
        ['paths', input.path, 'parameters'],
        fetcher,
    );
    if (commonParameters) {
        operation = {
            ...operation,
            parameters: [...commonParameters, ...(operation.parameters ?? [])],
        };
    }

    // Resolve servers
    const servers = await resolveOpenAPIPath<OpenAPIV3.ServerObject[]>(
        input.url,
        ['servers'],
        fetcher,
    );

    // Resolve securities
    const securities: OpenAPIOperationData['securities'] = [];
    for (const security of operation.security ?? []) {
        const securityKey = Object.keys(security)[0];

        const securityScheme = await resolveOpenAPIPath<OpenAPIV3.SecuritySchemeObject>(
            input.url,
            ['components', 'securitySchemes', securityKey],
            fetcher,
        );

        if (securityScheme) {
            securities.push([securityKey, securityScheme]);
        }
    }

    return {
        servers: servers ?? [],
        operation,
        method: input.method,
        path: input.path,
        securities,
        'x-codeSamples':
            typeof specData['x-codeSamples'] === 'boolean' ? specData['x-codeSamples'] : undefined,
        'x-hideTryItPanel':
            typeof specData['x-hideTryItPanel'] === 'boolean'
                ? specData['x-hideTryItPanel']
                : undefined,
    };
}

function cacheFetcher(fetcher: OpenAPIFetcher): OpenAPIFetcher {
    const cache = new Map<string, Promise<any>>();

    return {
        async fetch(url) {
            if (cache.has(url)) {
                return cache.get(url);
            }

            const promise = fetcher.fetch(url);
            cache.set(url, promise);
            return promise;
        },
        parseMarkdown: fetcher.parseMarkdown,
    };
}

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(url: string, text: string): Promise<OpenAPIV3.Document> {
    // Parse the JSON or YAML
    let data: unknown;

    // Try with JSON
    try {
        data = JSON.parse(text);
    } catch (jsonError) {
        try {
            // Try with YAML
            data = YAML.parse(text);
        } catch (yamlError) {
            if (yamlError instanceof Error && yamlError.name.startsWith('YAML')) {
                throw new OpenAPIFetchError('Failed to parse YAML: ' + yamlError.message, url);
            } else {
                throw yamlError;
            }
        }
    }

    // Convert Swagger 2.0 to OpenAPI 3.0
    // @ts-ignore
    if (data && data.swagger) {
        try {
            // Convert Swagger 2.0 to OpenAPI 3.0
            // @ts-ignore
            const result = (await swagger2openapi.convertObj(data, {
                resolve: false,
                resolveInternal: false,
                laxDefaults: true,
                laxurls: true,
                lint: false,
                prevalidate: false,
                anchors: true,
                patch: true,
            })) as ConvertOutputOptions;

            data = result.openapi;
        } catch (error) {
            if ((error as Error).name === 'S2OError') {
                throw new OpenAPIFetchError(
                    'Failed to convert Swagger 2.0 to OpenAPI 3.0: ' + (error as Error).message,
                    url,
                );
            } else {
                throw error;
            }
        }
    }

    // @ts-ignore
    return data;
}

export class OpenAPIFetchError extends Error {
    public name = 'OpenAPIFetchError';

    constructor(
        message: string,
        public readonly url: string,
    ) {
        super(message);
    }
}
