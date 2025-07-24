import {
    type Filesystem,
    OpenAPIParseError,
    type OpenAPIParseErrorCode,
    parseOpenAPI,
} from '@gitbook/openapi-parser';

import { DataFetcherError, noCacheFetchOptions } from '@/lib/data';
import { resolveContentRef } from '@/lib/references';
import { getCacheTag } from '@gitbook/cache-tags';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
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
        return fetchFilesystem(resolved.href, context.space.id);
    })();

    if ('error' in filesystem) {
        throw new OpenAPIParseError(filesystem.error.message, { code: filesystem.error.code });
    }

    return {
        filesystem,
        specUrl: resolved.href,
    };
}

const fetchFilesystem = async (
    url: string,
    spaceId: string
): Promise<
    | Filesystem
    | {
          error: {
              code: OpenAPIParseErrorCode;
              message: string;
          };
      }
> => {
    'use cache';
    try {
        cacheTag(getCacheTag({ tag: 'space', space: spaceId }));
        return await fetchFilesystemUncached(url);
    } catch (error) {
        // To avoid hammering the file with requests, we cache the error for around a minute.
        cacheLife('minutes');
        // Throwing an error inside a "use cache" function obfuscates the error,
        // so we need to handle it here and recreates the error outside the cache function.
        if (error instanceof OpenAPIParseError) {
            return { error: { code: error.code, message: error.message } };
        }
        if (error instanceof DataFetcherError) {
            return { error: { code: 'invalid' as const, message: 'Failed to fetch OpenAPI file' } };
        }
        // If the error is not an OpenAPIParseError or DataFetcherError,
        // we assume it's an unknown error and return a generic error.
        console.error('Unknown error while fetching OpenAPI file:', error);
        return { error: { code: 'invalid' as const, message: 'Unknown error' } };
    }
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
        cache: 'no-store',
        signal: options?.signal,
    });

    if (!response.ok) {
        throw new DataFetcherError('Failed to fetch OpenAPI file', response.status);
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
