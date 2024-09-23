import { ContentRef, DocumentBlockSwagger } from '@gitbook/api';
import {
    OpenAPIOperationData,
    fetchOpenAPIOperation,
    OpenAPIFetcher,
    parseOpenAPIV3,
    OpenAPIFetchError,
} from '@gitbook/react-openapi';

import { cache, parseCacheResponse, noCacheFetchOptions, CacheFunctionOptions } from '@/lib/cache';

import { parseMarkdown } from './markdown';
import { ResolvedContentRef } from './references';

/**
 * Fetch an OpenAPI specification for an operation.
 */
export async function fetchOpenAPIBlock(
    block: DocumentBlockSwagger,
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>,
): Promise<
    | { data: OpenAPIOperationData | null; error?: undefined }
    | { error: OpenAPIFetchError; data?: undefined }
> {
    const resolved = block.data.ref ? await resolveContentRef(block.data.ref) : null;
    if (!resolved || !block.data.path || !block.data.method) {
        return { data: null };
    }

    try {
        const data = await fetchOpenAPIOperation(
            {
                url: resolved.href,
                path: block.data.path,
                method: block.data.method,
            },
            fetcher,
        );

        return { data };
    } catch (error) {
        if (error instanceof OpenAPIFetchError) {
            return { error };
        }

        throw error;
    }
}

const fetcher: OpenAPIFetcher = {
    fetch: cache({
        name: 'openapi.fetch',
        get: async (url: string, options: CacheFunctionOptions) => {
            // Wrap the raw string to prevent invalid URLs from being passed to fetch.
            // This can happen if the URL has whitespace, which is currently handled differently by Cloudflare's implementation of fetch:
            // https://github.com/cloudflare/workerd/issues/1957
            const response = await fetch(new URL(url), {
                ...noCacheFetchOptions,
                signal: options.signal,
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch OpenAPI file: ${response.status} ${response.statusText}`,
                );
            }

            const text = await response.text();
            const data = await parseOpenAPIV3(url, text);
            return {
                ...parseCacheResponse(response),
                data,
            };
        },
    }),
    parseMarkdown,
};
