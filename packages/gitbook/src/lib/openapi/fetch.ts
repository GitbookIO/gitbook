import { parseOpenAPI } from '@gitbook/openapi-parser';

import { noCacheFetchOptions } from '@/lib/data';
import { resolveContentRef } from '@/lib/references';
import { assert } from 'ts-essentials';
import { enrichFilesystem } from './enrich';
import type {
    AnyOpenAPIOperationsBlock,
    OpenAPISchemasBlock,
    OpenAPIWebhookBlock,
    ResolveOpenAPIBlockArgs,
} from './types';
import type { FetchOpenAPIFilesystemResult } from './types';

type AnyOpenAPIBlock = AnyOpenAPIOperationsBlock | OpenAPISchemasBlock | OpenAPIWebhookBlock;

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

const fetchFilesystem = async (url: string) => {
    'use cache';
    return fetchFilesystemUncached(url);
};

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
