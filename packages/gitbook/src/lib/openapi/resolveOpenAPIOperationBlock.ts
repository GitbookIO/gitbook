import { fetchOpenAPIFilesystem } from '@/lib/openapi/fetch';
import { OpenAPIParseError } from '@gitbook/openapi-parser';
import { type OpenAPIOperationData, resolveOpenAPIOperation } from '@gitbook/react-openapi';
import type {
    AnyOpenAPIOperationsBlock,
    ResolveOpenAPIBlockArgs,
    ResolveOpenAPIBlockResult,
} from './types';

type ResolveOpenAPIOperationBlockResult = ResolveOpenAPIBlockResult<OpenAPIOperationData>;

const weakmap = new WeakMap<
    AnyOpenAPIOperationsBlock,
    Promise<ResolveOpenAPIOperationBlockResult>
>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPIOperationBlock(
    args: ResolveOpenAPIBlockArgs<AnyOpenAPIOperationsBlock>
): Promise<ResolveOpenAPIOperationBlockResult> {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block)!;
    }

    const result = baseResolveOpenAPIOperationBlock(args);
    weakmap.set(args.block, result);
    return result;
}

/**
 * Resolve OpenAPI operation block.
 */
async function baseResolveOpenAPIOperationBlock(
    args: ResolveOpenAPIBlockArgs<AnyOpenAPIOperationsBlock>
): Promise<ResolveOpenAPIOperationBlockResult> {
    const { context, block } = args;
    if (!block.data.path || !block.data.method) {
        return { data: null, specUrl: null };
    }

    try {
        const { filesystem, specUrl } = await fetchOpenAPIFilesystem({ block, context });

        if (!filesystem) {
            return { data: null, specUrl: null };
        }

        const data = await resolveOpenAPIOperation(filesystem, {
            path: block.data.path,
            method: block.data.method,
        });

        return { data, specUrl };
    } catch (error) {
        if (error instanceof OpenAPIParseError) {
            return { error };
        }

        throw error;
    }
}
