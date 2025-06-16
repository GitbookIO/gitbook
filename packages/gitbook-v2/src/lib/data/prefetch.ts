import { type PagePathParams, fetchPageData } from '@/components/SitePage';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import type { AncestorRevisionPage } from '@/lib/pages';
import {
    type ResolveContentRefOptions,
    type ResolvedContentRef,
    resolveContentRef,
} from '@/lib/references';
import type { ContentRef, JSONDocument, RevisionPageDocument } from '@gitbook/api';
import {
    type RouteLayoutParams,
    type RouteParams,
    getIcon,
    getPagePathFromParams,
    getStaticSiteContext,
} from '@v2/app/utils';
import { identify } from 'object-identity';
import { cache } from '../cache';
import type { GitBookSiteContext } from '../context';
import { getPageDocument } from './pages';

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
    getPrefetchedRef: (
        ref?: ContentRef,
        options?: ResolveContentRefOptions
    ) => Promise<ResolvedContentRef | null>;
}

const cachedInitialDate = cache(() => Date.now());

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
export async function getPageDataWithFallback(args: {
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

export async function getIcons(context: GitBookSiteContext): Promise<
    {
        url: string;
        type: string;
        media: string;
    }[]
> {
    return Promise.all([getIcon(context, 'light'), getIcon(context, 'dark')]).then((urls) => [
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
}

export const getPrefetchedDataFromLayoutParams = cache(
    (params: RouteLayoutParams): PrefetchedLayoutData => {
        const startingDate = cachedInitialDate();
        const staticSiteContext = getStaticSiteContext(params).finally(() => {
            console.log(`Finished fetching static site context in ${Date.now() - startingDate}ms`);
        });
        const icons = staticSiteContext
            .then(({ context }) => getIcons(context))
            .finally(() => {
                console.log(`Finished fetching icons in ${Date.now() - startingDate}ms`);
            });

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
    const fetched = new Map<string, Promise<ResolvedContentRef | null>>();
    if (!document) return fetched;

    const traverseNodes = (nodes: any[]): void => {
        for (const node of nodes) {
            // We try prefetching as many references as possible.
            if (node.data?.ref) {
                fetched.set(identify(node.data.ref), resolveContentRef(node.data.ref, context));
            }
            // Handle prefetching of references for cards
            if (node.data?.view && node.data.view.type === 'cards') {
                const view = node.data.view;
                const records = Object.entries(node.data.records || {});

                records.forEach(async (record: [string, any]) => {
                    const coverFile = view.coverDefinition
                        ? record[1].values[view.coverDefinition]?.[0]
                        : null;
                    const targetRef = view.targetDefinition
                        ? (record[1].values[view.targetDefinition] as ContentRef)
                        : null;
                    if (targetRef) {
                        fetched.set(identify(targetRef), resolveContentRef(targetRef, context));
                    }
                    if (coverFile) {
                        const fileRef = {
                            kind: 'file' as const,
                            file: coverFile,
                        };
                        fetched.set(identify(fileRef), resolveContentRef(fileRef, context));
                    }
                });
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
    return fetched;
};

export const getPrefetchedDataFromPageParams = cache((params: RouteParams): PrefetchedPageData => {
    const startingDate = cachedInitialDate();
    const { staticSiteContext } = getPrefetchedDataFromLayoutParams(params);
    const pathname = getPagePathFromParams(params);
    const pageData = staticSiteContext
        .then(({ context }) =>
            getPageDataWithFallback({
                context,
                pagePathParams: {
                    pathname,
                },
            })
        )
        .finally(() => {
            console.log(`Finished fetching page data in ${Date.now() - startingDate}ms`);
        });
    const document = pageData
        .then(({ context, pageTarget }) => {
            if (!pageTarget?.page) {
                return null;
            }
            return getPageDocument(context, pageTarget?.page);
        })
        .finally(() => {
            console.log(`Finished fetching document in ${Date.now() - startingDate}ms`);
        });
    const prefetchedRef = Promise.all([staticSiteContext, document])
        .then(([{ context }, document]) => {
            // Prefetch the references in the document
            return prefetchedDocumentRef(document, context);
        })
        .finally(() => {
            console.log(`Finished prefetching references in ${Date.now() - startingDate}ms`);
        });

    const getContentRef = async (
        ref?: ContentRef,
        options?: ResolveContentRefOptions
    ): Promise<ResolvedContentRef | null> => {
        if (!ref) {
            return null;
        }
        if (options) {
            const { context } = await staticSiteContext;
            return resolveContentRef(ref, context, options);
        }
        return prefetchedRef.then((prefetched) => prefetched.get(identify(ref)) ?? null);
    };

    return {
        pageData,
        document,
        getPrefetchedRef: getContentRef,
    };
});
