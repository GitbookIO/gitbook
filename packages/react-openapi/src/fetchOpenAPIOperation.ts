import { toJSON, fromJSON } from 'flatted';
import { OpenAPIV3 } from 'openapi-types';

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
    'x-codeSamples'?: OpenAPICustomCodeSample[];
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
export async function fetchOpenAPIOperation<Markdown>(
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
