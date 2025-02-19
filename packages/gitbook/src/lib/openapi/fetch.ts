import { ContentRef, DocumentBlockOpenAPI } from '@gitbook/api';
import { parseOpenAPI, OpenAPIParseError } from '@gitbook/openapi-parser';
import { type OpenAPIOperationData, resolveOpenAPIOperation } from '@gitbook/react-openapi';

import { cache, noCacheFetchOptions, CacheFunctionOptions } from '@/lib/cache';

import { enrichFilesystem } from './enrich';
import { ResolvedContentRef } from '../references';

/**
 * Fetch an OpenAPI specification for an operation.
 */
export async function fetchOpenAPIBlock(
    block: DocumentBlockOpenAPI,
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>,
): Promise<
    | { data: OpenAPIOperationData | null; specUrl: string | null; error?: undefined }
    | { error: OpenAPIParseError; data?: undefined; specUrl?: undefined }
> {
    const resolved = block.data.ref ? await resolveContentRef(block.data.ref) : null;
    if (!resolved || !block.data.path || !block.data.method) {
        return { data: null, specUrl: null };
    }

    try {
        const filesystem = await fetchFilesystem(resolved.href);
        const data = await resolveOpenAPIOperation(filesystem, {
            path: block.data.path,
            method: block.data.method,
        });

        return { data, specUrl: resolved.href };
    } catch (error) {
        if (error instanceof OpenAPIParseError) {
            return { error };
        }

        throw error;
    }
}

const fetchFilesystem = cache({
    name: 'openapi.fetch.v6',
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
        const filesystem = await parseOpenAPI({ value: text, rootURL: url });
        const richFilesystem = await enrichFilesystem(filesystem);
        return {
            // Cache for 4 hours
            ttl: 24 * 60 * 60,
            // Revalidate every 2 hours
            revalidateBefore: 22 * 60 * 60,
            data: richFilesystem,
        };
    },
});
