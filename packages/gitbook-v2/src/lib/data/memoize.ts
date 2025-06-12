import { type PagePathParams, fetchPageData } from '@/components/SitePage/fetch';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import type { AncestorRevisionPage } from '@/lib/pages';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import type { ContentRef, JSONDocument, RevisionPageDocument } from '@gitbook/api';
import {
    type RouteLayoutParams,
    type RouteParams,
    getIcon,
    getPagePathFromParams,
    getStaticSiteContext,
} from '@v2/app/utils';
import { cache } from 'react';
import type { GitBookSiteContext } from '../context';
import { getPageDocument } from './pages';

// This is used to create a context specific to the current request.
// This version works both in cloudflare and in vercel.
const getRequestContext = cache(() => ({}));

/**
 * Wrap a function by preventing concurrent executions of the same function.
 * With a logic to work per-request in Cloudflare Workers.
 */
export function withoutConcurrentExecution<ArgsType extends any[], ReturnType>(
    wrapped: (key: string, ...args: ArgsType) => Promise<ReturnType>
): (cacheKey: string, ...args: ArgsType) => Promise<ReturnType> {
    const globalPromiseCache = new WeakMap<object, Map<string, Promise<ReturnType>>>();

    return (key: string, ...args: ArgsType) => {
        const globalContext = getRequestContext();

        /**
         * Cache storage that is scoped to the current request when executed in Cloudflare Workers,
         * to avoid "Cannot perform I/O on behalf of a different request" errors.
         */
        const promiseCache =
            globalPromiseCache.get(globalContext) ?? new Map<string, Promise<ReturnType>>();
        globalPromiseCache.set(globalContext, promiseCache);

        const concurrent = promiseCache.get(key);
        if (concurrent) {
            return concurrent;
        }

        const promise = (async () => {
            try {
                const result = await wrapped(key, ...args);
                return result;
            } finally {
                promiseCache.delete(key);
            }
        })();

        promiseCache.set(key, promise);

        return promise;
    };
}

/**
 * Wrap a function by passing it a cache key that is computed from the function arguments.
 */
export function withCacheKey<ArgsType extends any[], ReturnType>(
    wrapped: (cacheKey: string, ...args: ArgsType) => Promise<ReturnType>
): (...args: ArgsType) => Promise<ReturnType> {
    return (...args: ArgsType) => {
        const cacheKey = getCacheKey(args);
        return wrapped(cacheKey, ...args);
    };
}

/**
 * Compute a cache key from the function arguments.
 */
function getCacheKey(args: any[]) {
    return JSON.stringify(deepSortValue(args));
}

function deepSortValue(value: unknown): unknown {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepSortValue);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, subValue]) => {
                return [key, deepSortValue(subValue)] as const;
            })
            .sort((a, b) => {
                return a[0].localeCompare(b[0]);
            });
    }

    return value;
}

export interface PrefetchedLayoutData {
    staticSiteContext: Promise<{
        context: GitBookSiteContext;
        visitorAuthClaims: VisitorAuthClaims;
    }>;
    icons: Promise<
        {
            url: string;
            type: string;
            media: string;
        }[]
    >;
}

export interface PrefetchedPageData {
    pageData: Promise<{
        context: GitBookSiteContext & {
            page?: RevisionPageDocument;
        };
        pageTarget?: {
            page: RevisionPageDocument;
            ancestors: AncestorRevisionPage[];
        };
    }>;
    document: Promise<JSONDocument | null>;
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(args: {
    context: GitBookSiteContext;
    pagePathParams: PagePathParams;
}) {
    const { context: baseContext, pagePathParams } = args;
    const { context, pageTarget } = await fetchPageData(baseContext, pagePathParams);

    return {
        context: {
            ...context,
            page: pageTarget?.page,
        },
        pageTarget,
    };
}

export const getPrefetchedDataFromLayoutParams = cache(
    (params: RouteLayoutParams): PrefetchedLayoutData => {
        const staticSiteContext = getStaticSiteContext(params);
        const icons = Promise.all([
            staticSiteContext.then(({ context }) => getIcon(context, 'light')),
            staticSiteContext.then(({ context }) => getIcon(context, 'dark')),
        ]).then((urls) => [
            {
                url: urls[0],
                type: 'image/png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: urls[1],
                type: 'image/png',
                media: '(prefers-color-scheme: dark)',
            },
        ]);

        return {
            staticSiteContext,
            icons,
        };
    }
);

export const prefetchedDocumentRef = (
    document: JSONDocument | null,
    context: GitBookSiteContext
) => {
    const fetched = new Map<ContentRef, Promise<ResolvedContentRef | null>>();
    if (!document) return fetched;

    const traverseNodes = (nodes: any[]): void => {
        for (const node of nodes) {
            // We try prefetching as many references as possible.
            if (node.data?.ref) {
                fetched.set(node.data.ref, resolveContentRef(node.data.ref, context));
            }
            if (node.nodes && Array.isArray(node.nodes)) {
                traverseNodes(node.nodes);
            }
            if (node.fragments && Array.isArray(node.fragments)) {
                traverseNodes(node.fragments);
            }
        }
    };

    if (document.nodes && Array.isArray(document.nodes)) {
        traverseNodes(document.nodes);
    }
    console.log('Prefetched document references:', fetched.size);
    return fetched;
};

export const getPrefetchedDataFromPageParams = cache((params: RouteParams): PrefetchedPageData => {
    const { staticSiteContext } = getPrefetchedDataFromLayoutParams(params);
    const pathname = getPagePathFromParams(params);
    const pageData = staticSiteContext.then(({ context }) =>
        getPageDataWithFallback({
            context,
            pagePathParams: {
                pathname,
            },
        })
    );
    const document = pageData.then(({ context, pageTarget }) => {
        if (!pageTarget?.page) {
            return null;
        }
        return getPageDocument(context.dataFetcher, context.space, pageTarget?.page);
    });
    Promise.all([staticSiteContext, document]).then(([{ context }, document]) => {
        // Prefetch the references in the document
        prefetchedDocumentRef(document, context);
    });
    return {
        pageData,
        document,
    };
});

export const cachedDate = cache(() => Date.now());
