import { ContentRef, DocumentBlockSwagger } from '@gitbook/api';
import {
    OpenAPIOperationData,
    fetchOpenAPIOperation,
    OpenAPIFetcher,
} from '@gitbook/react-openapi';
import yaml from 'js-yaml';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';

import { cache, parseCacheResponse, noCacheFetchOptions, CacheFunctionOptions } from '@/lib/cache';

import { parseMarkdown } from './markdown';
import { ResolvedContentRef } from './references';

/**
 * Fetch an OpenAPI specification for an operation.
 */
export async function fetchOpenAPIBlock(
    block: DocumentBlockSwagger,
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>,
): Promise<OpenAPIOperationData | null> {
    const resolved = block.data.ref ? await resolveContentRef(block.data.ref) : null;

    if (!resolved || !block.data.path || !block.data.method) {
        return null;
    }

    const data = await fetchOpenAPIOperation(
        {
            url: resolved.href,
            path: block.data.path,
            method: block.data.method,
        },
        fetcher,
    );

    return data;
}

const fetcher: OpenAPIFetcher = {
    fetch: cache('openapi.fetch', async (url: string, options: CacheFunctionOptions) => {
        const response = await fetch(url, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });

        let data: unknown = null;

        if (response.ok) {
            const text = await response.text();

            // Try with JSON
            try {
                data = JSON.parse(text);
            } catch (error) {
                //
            }

            // Try with YAML
            if (!data) {
                try {
                    data = yaml.load(text);
                } catch (error) {
                    //
                }
            }
        }

        // @ts-ignore
        if (data && data.swagger) {
            try {
                // Convert Swagger 2.0 to OpenAPI 3.0
                // @ts-ignore
                const result = (await swagger2openapi.convertObj(data, {
                    resolve: false,
                    resolveInternal: false,
                    laxDefaults: true,
                    laxurls: true,
                    lint: false,
                    prevalidate: false,
                })) as ConvertOutputOptions;

                data = result.openapi;
            } catch (error) {
                console.warn('Failed to convert Swagger 2.0 to OpenAPI 3.0', error);
                data = null;
            }
        }

        return {
            ...parseCacheResponse(response),
            data,
        };
    }),
    parseMarkdown,
};
