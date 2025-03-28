import { parseOpenAPI } from '@gitbook/openapi-parser';

import { type CacheFunctionOptions, cache, noCacheFetchOptions } from '@/lib/cache';
import type {
    AnyOpenAPIOperationsBlock,
    OpenAPISchemasBlock,
    ResolveOpenAPIBlockArgs,
} from '@/lib/openapi/types';
import { memoize } from '@v2/lib/data/memoize';
import { assert } from 'ts-essentials';
import { resolveContentRef } from '../references';
import { isV2 } from '../v2';
import { enrichFilesystem } from './enrich';
import type { FetchOpenAPIFilesystemResult } from './types';

type AnyOpenAPIBlock = AnyOpenAPIOperationsBlock | OpenAPISchemasBlock;

/**
 * Fetch OpenAPI block.
 */
export async function fetchOpenAPIFilesystem(
    args: ResolveOpenAPIBlockArgs<AnyOpenAPIBlock>
): Promise<FetchOpenAPIFilesystemResult> {
    const { context, block } = args;

    const ref = block.data.ref;
    const resolved = ref ? await resolveContentRef(ref, context) : null;

    if (!resolved) {
        return { filesystem: null, specUrl: null };
    }

    const filesystem = await (() => {
        if (ref.kind === 'openapi') {
            assert(resolved.openAPIFilesystem);
            return resolved.openAPIFilesystem;
        }
        return fetchFilesystem(resolved.href);
    })();

    return {
        filesystem,
        specUrl: resolved.href,
    };
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
            // Cache for 24 hours
            ttl: 24 * 60 * 60,
            // Revalidate every 2 hours
            revalidateBefore: 22 * 60 * 60,
            data: richFilesystem,
        };
    },
});

const fetchFilesystemV2 = memoize(async function fetchFilesystemV2(url: string) {
    'use cache';

    // TODO: add cache lifetime once we can use next.js 15 code here

    const response = await fetchFilesystemUncached(url);

    return response;
});

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
