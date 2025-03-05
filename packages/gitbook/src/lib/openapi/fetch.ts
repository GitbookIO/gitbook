import type { DocumentBlockOpenAPI, DocumentBlockOpenAPIOperation } from '@gitbook/api';
import { OpenAPIParseError, parseOpenAPI } from '@gitbook/openapi-parser';
import {
    type OpenAPIModelsData,
    type OpenAPIOperationData,
    resolveOpenAPIModels,
    resolveOpenAPIOperation,
} from '@gitbook/react-openapi';
import type { GitBookAnyContext } from '@v2/lib/context';

import { type CacheFunctionOptions, cache, noCacheFetchOptions } from '@/lib/cache';

import { assert } from 'ts-essentials';
import { resolveContentRef } from '../references';
import { isV2 } from '../v2';
import { enrichFilesystem } from './enrich';

export type AnyOpenAPIOperationBlock = DocumentBlockOpenAPI | DocumentBlockOpenAPIOperation;

export type OpenAPIBlockType = 'operation' | 'models';

export type ResolveOpenAPIOperationBlockResult = {
    error: undefined;
    data: OpenAPIOperationData | null;
    specUrl: string | null;
};

export type ResolveOpenAPIModelsBlockResult = {
    error: undefined;
    data: OpenAPIModelsData | null;
    specUrl: string | null;
};

export type ResolveOpenAPIBlockResult<T extends OpenAPIBlockType = OpenAPIBlockType> =
    | (T extends 'operation' ? ResolveOpenAPIOperationBlockResult : ResolveOpenAPIModelsBlockResult)
    | ResolveOpenAPIBlockError;

type ResolveOpenAPIBlockError = { error: OpenAPIParseError; data?: undefined; specUrl?: undefined };

type ResolveOpenAPIBlockArgs<T extends OpenAPIBlockType = OpenAPIBlockType> = {
    block: AnyOpenAPIOperationBlock;
    context: GitBookAnyContext;
    /**
     * The type of the block.
     * Can be either 'operation' or 'models'.
     * @default 'operation'
     */
    type?: T | OpenAPIBlockType;
};

const weakmap = new WeakMap<AnyOpenAPIOperationBlock, Promise<ResolveOpenAPIBlockResult>>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPIBlock<T extends OpenAPIBlockType = 'operation'>(
    args: ResolveOpenAPIBlockArgs<T>
): Promise<ResolveOpenAPIBlockResult<T>> {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block) as Promise<ResolveOpenAPIBlockResult<T>>;
    }

    const result = baseResolveOpenAPIBlock(args);
    weakmap.set(args.block, result as Promise<ResolveOpenAPIBlockResult<T>>);
    return result;
}

/**
 * Resolve OpenAPI block.
 */
async function baseResolveOpenAPIBlock<T extends OpenAPIBlockType = 'operation'>(
    args: ResolveOpenAPIBlockArgs<T>
): Promise<ResolveOpenAPIBlockResult<T>> {
    const { context, block, type = 'operation' } = args;
    if (!block.data.path || !block.data.method) {
        return { data: null, specUrl: null } as ResolveOpenAPIBlockResult<T>;
    }

    const ref = block.data.ref;
    const resolved = ref ? await resolveContentRef(ref, context) : null;

    if (!resolved) {
        return { data: null, specUrl: null } as ResolveOpenAPIBlockResult<T>;
    }

    try {
        const filesystem = await (() => {
            if (ref.kind === 'openapi') {
                assert(resolved.openAPIFilesystem);
                return resolved.openAPIFilesystem;
            }
            return fetchFilesystem(resolved.href);
        })();

        if (type === 'models') {
            const data = await resolveOpenAPIModels(filesystem);
            return { data: data, specUrl: resolved.href } as ResolveOpenAPIBlockResult<T>;
        }

        const data = await resolveOpenAPIOperation(filesystem, {
            path: block.data.path,
            method: block.data.method,
        });

        return { data, specUrl: resolved.href } as ResolveOpenAPIBlockResult<T>;
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
