import { toJSON, fromJSON } from 'flatted';
import { OpenAPIV3 } from 'openapi-types';

import { resolveOpenAPIPath } from './resolveOpenAPIPath';
import { OpenAPIFetcher } from './types';

export interface OpenAPIOperationData {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3.SecuritySchemeObject][];
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
