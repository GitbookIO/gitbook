import type { DocumentBlockOpenAPI } from '@gitbook/api';
import { OpenAPIParseError, parseOpenAPI } from '@gitbook/openapi-parser';
import { type OpenAPIOperationData, resolveOpenAPIOperation } from '@gitbook/react-openapi';
import type { GitBookAnyContext } from '@v2/lib/context';

import { type CacheFunctionOptions, cache, noCacheFetchOptions } from '@/lib/cache';

import { resolveContentRef } from '../references';
import { isV2 } from '../v2';
import { enrichFilesystem } from './enrich';

const weakmap = new WeakMap<DocumentBlockOpenAPI, ResolveOpenAPIBlockResult>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPIBlock(args: ResolveOpenAPIBlockArgs): ResolveOpenAPIBlockResult {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block)!;
    }

    const result = baseResolveOpenAPIBlock(args);
    weakmap.set(args.block, result);
    return result;
}

type ResolveOpenAPIBlockArgs = {
    block: DocumentBlockOpenAPI;
    context: GitBookAnyContext;
};
type ResolveOpenAPIBlockResult = Promise<
    | { error?: undefined; data: OpenAPIOperationData | null; specUrl: string | null }
    | { error: OpenAPIParseError; data?: undefined; specUrl?: undefined }
>;
/**
 * Resolve OpenAPI block.
 */
async function baseResolveOpenAPIBlock(args: ResolveOpenAPIBlockArgs): ResolveOpenAPIBlockResult {
    const { context, block } = args;
    if (!block.data.path || !block.data.method) {
        return { data: null, specUrl: null };
    }

    const resolved = block.data.ref ? await resolveContentRef(block.data.ref, context) : null;

    if (!resolved) {
        return { data: null, specUrl: null };
    }

    try {
        const filesystem = resolved.openAPIFilesystem ?? (await fetchFilesystem(resolved.href));

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

function fetchFilesystem(url: string) {
    if (isV2()) {
        return fetchFilesystemV2(url);
    }

    return fetchFilesystemV1(url);
}

const fetchFilesystemV1 = cache({
    name: 'openapi.fetch.v6',
    get: async (url: string, options: CacheFunctionOptions) => {
        const richFilesystem = await fetchFilesystemUncached(url, options);
        return {
            // Cache for 4 hours
            ttl: 24 * 60 * 60,
            // Revalidate every 2 hours
            revalidateBefore: 22 * 60 * 60,
            data: richFilesystem,
        };
    },
});

async function fetchFilesystemV2(url: string) {
    'use cache';

    // TODO: add cache lifetime once we can use next.js 15 code here

    const response = await fetchFilesystemUncached(url);

    return response;
}

async function fetchFilesystemUncached(
    url: string,
    options?: {
        signal?: AbortSignal;
    }
) {
    // Wrap the raw string to prevent invalid URLs from being passed to fetch.
    // This can happen if the URL has whitespace, which is currently handled differently by Cloudflare's implementation of fetch:
    // https://github.com/cloudflare/workerd/issues/1957
    const response = await fetch(new URL(url), {
        ...noCacheFetchOptions,
        signal: options?.signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI file: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const filesystem = await parseOpenAPI({
        value: text,
        rootURL: url,
        // If we fetch the OpenAPI specification
        // it's the legacy system, it means the spec can be trusted here.
        trust: true,
    });
    const richFilesystem = await enrichFilesystem(filesystem);

    return richFilesystem;
}
