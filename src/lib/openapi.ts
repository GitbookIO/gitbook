import { ContentRef, DocumentBlockSwagger } from '@gitbook/api';
import {
    OpenAPIOperationData,
    fetchOpenAPIOperation,
    OpenAPIFetcher,
} from '@gitbook/react-openapi';
import yaml from 'js-yaml';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';
import { unified } from 'unified';

import { cache, parseCacheResponse, noCacheFetchOptions } from '@/lib/cache';

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
    fetch: cache('openapi.fetch', async (url: string) => {
        const response = await fetch(url, {
            ...noCacheFetchOptions,
        });

        let data: unknown = null;

        if (response.ok) {
            if (response.headers.get('content-type')?.includes('yaml')) {
                try {
                    data = yaml.load(await response.text());
                } catch (error) {
                    //
                }
            } else if (response.headers.get('content-type')?.includes('json')) {
                try {
                    data = await response.json();
                } catch (error) {
                    //
                }
            }
        }

        // @ts-ignore
        if (data && data.swagger) {
            // Convert Swagger 2.0 to OpenAPI 3.0
            // @ts-ignore
            const result = (await swagger2openapi.convertObj(data, {
                resolve: false,
                resolveInternal: false,
            })) as ConvertOutputOptions;

            data = result.openapi;
        }

        return {
            ...parseCacheResponse(response),
            data,
        };
    }),
    parseMarkdown: async (markdown: string) => {
        const file = await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .process(markdown);

        return file.toString();
    },
};
