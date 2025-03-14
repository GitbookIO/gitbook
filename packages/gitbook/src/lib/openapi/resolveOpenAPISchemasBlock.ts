import { OpenAPIParseError } from '@gitbook/openapi-parser';
import { type OpenAPISchemasData, resolveOpenAPISchemas } from '@gitbook/react-openapi';
import { fetchOpenAPIFilesystem } from './fetch';
import type {
    OpenAPISchemasBlock,
    ResolveOpenAPIBlockArgs,
    ResolveOpenAPIBlockResult,
} from './types';

type ResolveOpenAPISchemasBlockResult = ResolveOpenAPIBlockResult<OpenAPISchemasData>;

const weakmap = new WeakMap<OpenAPISchemasBlock, Promise<ResolveOpenAPISchemasBlockResult>>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPISchemasBlock(
    args: ResolveOpenAPIBlockArgs<OpenAPISchemasBlock>
): Promise<ResolveOpenAPISchemasBlockResult> {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block)!;
    }

    const result = baseResolveOpenAPISchemasBlock(args);
    weakmap.set(args.block, result);
    return result;
}

/**
 * Resolve OpenAPI schemas block.
 */
async function baseResolveOpenAPISchemasBlock(
    args: ResolveOpenAPIBlockArgs<OpenAPISchemasBlock>
): Promise<ResolveOpenAPISchemasBlockResult> {
    const { context, block } = args;
    if (!block.data.schemas || !block.data.schemas.length) {
        return { data: null, specUrl: null };
    }

    try {
        const { filesystem, specUrl } = await fetchOpenAPIFilesystem({ block, context });

        if (!filesystem || !specUrl) {
            return { data: null, specUrl: null };
        }

        const data = await resolveOpenAPISchemas(filesystem, {
            schemas: block.data.schemas,
        });

        return { data, specUrl };
    } catch (error) {
        if (error instanceof OpenAPIParseError) {
            return { error };
        }

        throw error;
    }
}
