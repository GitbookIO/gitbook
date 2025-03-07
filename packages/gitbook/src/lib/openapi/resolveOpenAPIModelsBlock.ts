import { fetchOpenAPIFilesystem } from '@/lib/openapi/fetch';
import type { ResolveOpenAPIBlockResult } from '@/lib/openapi/types';
import { OpenAPIParseError } from '@gitbook/openapi-parser';
import { type OpenAPIModelsData, resolveOpenAPIModels } from '@gitbook/react-openapi';
import type { AnyOpenAPIBlock, ResolveOpenAPIBlockArgs } from './types';

type ResolveOpenAPIModelsBlockResult = ResolveOpenAPIBlockResult<OpenAPIModelsData>;

const weakmap = new WeakMap<AnyOpenAPIBlock, Promise<ResolveOpenAPIModelsBlockResult>>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPIModelsBlock(
    args: ResolveOpenAPIBlockArgs
): Promise<ResolveOpenAPIModelsBlockResult> {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block)!;
    }

    const result = baseResolveOpenAPIModelsBlock(args);
    weakmap.set(args.block, result);
    return result;
}

/**
 * Resolve OpenAPI models block.
 */
async function baseResolveOpenAPIModelsBlock(
    args: ResolveOpenAPIBlockArgs
): Promise<ResolveOpenAPIModelsBlockResult> {
    const { context, block } = args;
    if (!block.data.path || !block.data.method) {
        return { data: null, specUrl: null };
    }

    try {
        const { filesystem, specUrl } = await fetchOpenAPIFilesystem({ block, context });

        if (!filesystem || !specUrl) {
            return { data: null, specUrl: null };
        }

        const data = await resolveOpenAPIModels(filesystem);

        return { data, specUrl };
    } catch (error) {
        if (error instanceof OpenAPIParseError) {
            return { error };
        }

        throw error;
    }
}
