import { OpenAPIV3 } from 'openapi-types';
import { toJSON, fromJSON } from 'flatted';

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

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL.
     * It should the parsed JSON object or throw an error if the file is not found or can't be parsed.
     *
     * It should return a V3 spec.
     * The data will be mutated.
     */
    fetch: (url: string) => Promise<any>;

    /**
     * Parse markdown to the react element to render.
     */
    parseMarkdown?: (input: string) => Promise<string>;
}

export const SYMBOL_REF_RESOLVED = '__$refResolved';
export const SYMBOL_MARKDOWN_PARSED = '__$markdownParsed';

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

    let operation = await resolveOpenAPI<OpenAPIV3.OperationObject>(
        input.url,
        ['paths', input.path, input.method],
        fetcher,
    );

    if (!operation) {
        return null;
    }

    // Resolve common parameters
    const commonParameters = await resolveOpenAPI<OpenAPIV3.ParameterObject[]>(
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
    const servers = await resolveOpenAPI<OpenAPIV3.ServerObject[]>(input.url, ['servers'], fetcher);

    // Resolve securities
    const securities: OpenAPIOperationData['securities'] = [];
    for (const security of operation.security ?? []) {
        const securityKey = Object.keys(security)[0];

        const securityScheme = await resolveOpenAPI<OpenAPIV3.SecuritySchemeObject>(
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

/**
 * Resolve a path in a OpenAPI file.
 * It resolves any reference needed to resolve the path, ignoring other references outside the path.
 */
async function resolveOpenAPI<T>(
    url: string,
    dataPath: string[],
    fetcher: OpenAPIFetcher,
): Promise<T | undefined> {
    const data = await fetcher.fetch(url);
    if (!data) {
        return undefined;
    }

    let value: unknown = data;

    const lastKey = dataPath[dataPath.length - 1];
    dataPath = dataPath.slice(0, -1);

    for (const part of dataPath) {
        if (typeof value !== 'object' || value === null) {
            return undefined;
        }

        // @ts-ignore
        if (isRef(value[part])) {
            await transformAll(url, value, part, fetcher);
        }

        // @ts-ignore
        value = value[part];
    }

    await transformAll(url, value, lastKey, fetcher);
    // @ts-ignore
    return value[lastKey] as T;
}

/**
 * Recursively process a part of the OpenAPI spec to resolve all references.
 */
async function transformAll(
    url: string,
    data: any,
    key: string | number,
    fetcher: OpenAPIFetcher,
): Promise<void> {
    const value = data[key];

    if (
        typeof value === 'string' &&
        key === 'description' &&
        fetcher.parseMarkdown &&
        !data[SYMBOL_MARKDOWN_PARSED]
    ) {
        // Parse markdown
        data[SYMBOL_MARKDOWN_PARSED] = true;
        data[key] = await fetcher.parseMarkdown(value);
    } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
    ) {
        // Primitives
    } else if (typeof value === 'object' && value !== null && SYMBOL_REF_RESOLVED in value) {
        // Ref was already resolved
    } else if (isRef(value)) {
        const ref = value.$ref;

        // Delete the ref to avoid infinite loop with circular references
        // @ts-ignore
        delete value.$ref;

        data[key] = await resolveReference(url, ref, fetcher);
        if (data[key]) {
            data[key][SYMBOL_REF_RESOLVED] = extractRefName(ref);
        }
    } else if (Array.isArray(value)) {
        // Recursively resolve all references in the array
        await Promise.all(value.map((item, index) => transformAll(url, value, index, fetcher)));
    } else if (typeof value === 'object' && value !== null) {
        // Recursively resolve all references in the object
        const keys = Object.keys(value);
        for (const key of keys) {
            await transformAll(url, value, key, fetcher);
        }
    }
}

async function resolveReference(
    origin: string,
    ref: string,
    fetcher: OpenAPIFetcher,
): Promise<any> {
    const parsed = parseReference(origin, ref);
    return resolveOpenAPI(parsed.url, parsed.dataPath, fetcher);
}

function parseReference(origin: string, ref: string): { url: string; dataPath: string[] } {
    if (!ref) {
        return {
            url: origin,
            dataPath: [],
        };
    }

    if (ref.startsWith('#')) {
        // Local references
        const dataPath = ref.split('/').filter(Boolean).slice(1);
        return {
            url: origin,
            dataPath,
        };
    }

    // Absolute references
    const url = new URL(ref, origin);
    if (url.hash) {
        const hash = url.hash;
        url.hash = '';
        return parseReference(url.toString(), hash);
    }

    return {
        url: url.toString(),
        dataPath: [],
    };
}

function extractRefName(ref: string): string {
    const parts = ref.split('/');
    return parts[parts.length - 1];
}

function isRef(ref: any): ref is { $ref: string } {
    return typeof ref === 'object' && ref !== null && '$ref' in ref && ref.$ref;
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
