import { fetchOpenAPIFilesystem } from '@/lib/openapi/fetch';
import { OpenAPIParseError } from '@gitbook/openapi-parser';
import { type OpenAPIWebhookData, resolveOpenAPIWebhook } from '@gitbook/react-openapi';
import type {
    OpenAPIWebhookBlock,
    ResolveOpenAPIBlockArgs,
    ResolveOpenAPIBlockResult,
} from './types';

type ResolveOpenAPIWebhookBlockResult = ResolveOpenAPIBlockResult<OpenAPIWebhookData>;

const weakmap = new WeakMap<OpenAPIWebhookBlock, Promise<ResolveOpenAPIWebhookBlockResult>>();

/**
 * Cache the result of resolving an OpenAPI block.
 * It is important because the resolve is called in sections and in the block itself.
 */
export function resolveOpenAPIWebhookBlock(
    args: ResolveOpenAPIBlockArgs<OpenAPIWebhookBlock>
): Promise<ResolveOpenAPIWebhookBlockResult> {
    if (weakmap.has(args.block)) {
        return weakmap.get(args.block)!;
    }

    const result = baseResolveOpenAPIWebhookBlock(args);
    weakmap.set(args.block, result);
    return result;
}

/**
 * Resolve OpenAPI webhook block.
 */
async function baseResolveOpenAPIWebhookBlock(
    args: ResolveOpenAPIBlockArgs<OpenAPIWebhookBlock>
): Promise<ResolveOpenAPIWebhookBlockResult> {
    const { context, block } = args;
    if (!block.data.name || !block.data.method) {
        return { data: null, specUrl: null };
    }

    try {
        const { filesystem, specUrl } = await fetchOpenAPIFilesystem({ block, context });

        if (!filesystem) {
            return { data: null, specUrl: null };
        }

        const data = await resolveOpenAPIWebhook(filesystem, {
            name: block.data.name,
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
