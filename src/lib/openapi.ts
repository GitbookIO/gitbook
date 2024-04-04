import { ContentRef, DocumentBlockSwagger } from '@gitbook/api';

import { cache, parseCacheResponse, noCacheFetchOptions, CacheFunctionOptions } from '@/lib/cache';

import {
    OpenAPIOperationData,
    fetchOpenAPIOperation,
    OpenAPIFetcher,
    parseOpenAPIV3,
    OpenAPIFetchError,
} from '@gitbook/react-openapi';

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

        return {
            error: new OpenAPIFetchError(
                `Failed to fetch OpenAPI block: ${error instanceof Error ? error.message : typeof error}`,
                resolved.href,
            ),
        };
    }
}

const fetcher: OpenAPIFetcher = {
    fetch: cache('openapi.fetch', async (url: string, options: CacheFunctionOptions) => {
        // Wrap the raw string to prevent invalid URLs from being passed to fetch.
        // This can happen if the URL has whitespace, which is currently handled differently by Cloudflare's implementation of fetch:
        // 
        const response = await fetch(new URL(url), {
            ...noCacheFetchOptions,
            signal: options.signal,
        });

        if (!response.ok) {
            throw new OpenAPIFetchError(
                `Failed to fetch OpenAPI file: ${response.status} ${response.statusText}`,
                url,
            );
        }

        const text = await response.text();
        const data = await parseOpenAPIV3(url, text);
        return {
            ...parseCacheResponse(response),
            data,
        };
    }),
    parseMarkdown,
};
