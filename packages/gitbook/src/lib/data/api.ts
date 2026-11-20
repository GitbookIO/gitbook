import { parse as parseCacheControl } from '@tusbar/cache-control';
import { cacheLife, cacheTag } from 'next/cache';

import {
    type ComputedContentSource,
    GitBookAPI,
    type HttpResponse,
    type RenderIntegrationUI,
    type SiteSearchScope,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';

import { cache } from '../cache';
import { DataFetcherError, wrapDataFetcherError } from './errors';
import type { DataFetcherResponse, GitBookDataFetcher } from './types';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@/lib/env';
import { trace } from '@/lib/tracing';

interface DataFetcherInput {
    /**
     * API token.
     */
    apiToken: string | null;

    /**
     * Site revision being previewed. The site's spaces and OpenAPI specs are read at it.
     */
    siteRevision?: DataFetcherSiteRevision;
}

/**
 * A site revision, as a preview URL resolves it.
 */
export interface DataFetcherSiteRevision {
    organizationId: string;
    siteId: string;
    siteRevisionId: string;
    /**
     * Spaces of the site, read at the site revision. Other spaces are read live. Until the site
     * structure is known, every space is read at the site revision.
     */
    spaceIds?: string[];
}

/**
 * Options to pass to the `fetch` call to disable the Next data-cache when wrapped in `use cache`.
 */
export const noCacheFetchOptions: Partial<RequestInit> = {
    next: {
        revalidate: 0,
    },
};

/**
 * Create a data fetcher using an API token.
 * The data are being cached by Next.js built-in cache.
 */
export function createDataFetcher(
    input: DataFetcherInput = { apiToken: null }
): GitBookDataFetcher {
    return {
        async api() {
            return apiClient(input);
        },

        withToken({ apiToken }) {
            return createDataFetcher({
                ...input,
                apiToken,
            });
        },

        withSiteRevisionSpaces(spaceIds) {
            return createDataFetcher({
                ...input,
                siteRevision: input.siteRevision ? { ...input.siteRevision, spaceIds } : undefined,
            });
        },

        //
        // API that are tied to the token
        //
        getPublishedContentSite(params) {
            return getPublishedContentSite(
                input,
                {
                    organizationId: params.organizationId,
                    siteId: params.siteId,
                    siteShareKey: params.siteShareKey,
                },
                // This api version is used to invalidate cache when we do breaking changes to the API client.
                // Something not backward compatible like changing the shape of the data returned by the API.
                // We should bump this version when we do breaking changes to this specific endpoint returned data.
                // DO NOT BUMP IT for other non-breaking changes.
                '0.158'
            );
        },
        getSiteRedirectBySource(params) {
            return getSiteRedirectBySource(input, {
                organizationId: params.organizationId,
                siteId: params.siteId,
                siteShareKey: params.siteShareKey,
                source: params.source,
            });
        },
        getRevision(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}`,
                { metadata: params.metadata ?? false },
                () =>
                    getRevision(input, {
                        spaceId: params.spaceId,
                        revisionId: params.revisionId,
                        metadata: params.metadata ?? false,
                    })
            );
        },
        getRevisionPageByPath(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}/path/${encodeURIComponent(params.path)}`,
                {
                    metadata: params.metadata ?? false,
                    cachedMetadata: params.cachedMetadata ?? false,
                },
                () =>
                    getRevisionPageByPath(input, {
                        spaceId: params.spaceId,
                        revisionId: params.revisionId,
                        path: params.path,
                        metadata: params.metadata,
                        cachedMetadata: params.cachedMetadata,
                    })
            );
        },
        getRevisionPageMarkdown(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}/page/${params.pageId}`,
                {
                    format: 'markdown',
                    'format.markdown.refs': 'stable',
                    evaluated: 'deterministic-only',
                    metadata: false,
                },
                () =>
                    getRevisionPageMarkdown(
                        input,
                        {
                            spaceId: params.spaceId,
                            revisionId: params.revisionId,
                            pageId: params.pageId,
                        },
                        // We pass the name of the function to distinguish between cache entries
                        // By default Next only uses the arguments, the filename and the position of the function inside the file
                        // By adding a dummy argument with the function name, we can change the order without breaking anything
                        'getRevisionPageMarkdown'
                    )
            );
        },
        getRevisionPageDocument(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}/page/${params.pageId}/document`,
                { evaluated: 'deterministic-only', dereferenced: 'reusable-contents' },
                () =>
                    getRevisionPageDocument(
                        input,
                        {
                            spaceId: params.spaceId,
                            revisionId: params.revisionId,
                            pageId: params.pageId,
                        },
                        // We pass the name of the function to distinguish between cache entries
                        // By default Next only uses the arguments, the filename and the position of the function inside the file
                        // By adding a dummy argument with the function name, we can change the order without breaking anything
                        'getRevisionPageDocument'
                    )
            );
        },
        getRevisionReusableContentDocument(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}/reusable-contents/${params.reusableContentId}/document`,
                { evaluated: 'deterministic-only' },
                () =>
                    getRevisionReusableContentDocument(input, {
                        spaceId: params.spaceId,
                        revisionId: params.revisionId,
                        reusableContentId: params.reusableContentId,
                    })
            );
        },
        getLatestOpenAPISpecVersionContent(params) {
            return readAtSiteRevision(input, null, `openapi/${params.slug}/content`, {}, () =>
                getLatestOpenAPISpecVersionContent(input, {
                    organizationId: params.organizationId,
                    slug: params.slug,
                })
            );
        },
        getSpace(params) {
            return getSpace(input, {
                spaceId: params.spaceId,
                shareKey: params.shareKey,
            });
        },
        getChangeRequest(params) {
            return getChangeRequest(input, {
                spaceId: params.spaceId,
                changeRequestId: params.changeRequestId,
            });
        },
        getChangeRequestChanges(params) {
            return getChangeRequestChanges(input, {
                spaceId: params.spaceId,
                changeRequestId: params.changeRequestId,
                limit: params.limit,
            });
        },
        getRevisionSemanticChanges(params) {
            return getRevisionSemanticChanges(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                limit: params.limit,
            });
        },
        getDocument(params) {
            return getDocument(input, {
                spaceId: params.spaceId,
                documentId: params.documentId,
            });
        },
        getComputedDocument(params) {
            return getComputedDocument(input, {
                organizationId: params.organizationId,
                spaceId: params.spaceId,
                source: params.source,
                seed: params.seed,
            });
        },
        getEmbedByUrl(params) {
            return getEmbedByUrl(input, {
                url: params.url,
                spaceId: params.spaceId,
            });
        },
        searchSiteContent(params) {
            return searchSiteContent(input, params);
        },

        renderIntegrationUi(params) {
            return renderIntegrationUi(input, {
                integrationName: params.integrationName,
                request: params.request,
            });
        },

        getUserById(userId) {
            return getUserById(input, { userId });
        },

        listRevisionPageMetaLinks(params) {
            return readAtSiteRevision(
                input,
                params.spaceId,
                `content/${params.spaceId}/page/${params.pageId}/meta-links`,
                {},
                () =>
                    listRevisionPageMetaLinks(input, {
                        spaceId: params.spaceId,
                        revisionId: params.revisionId,
                        pageId: params.pageId,
                    })
            );
        },
    };
}

/**
 * Read content at the site revision of the input, with the same query as `live` reads it. Reads
 * live when there is no site revision, or for a space outside the site. An OpenAPI spec (no
 * space) is always read at the site revision.
 */
async function readAtSiteRevision<T>(
    input: DataFetcherInput,
    spaceId: string | null,
    path: string,
    query: Record<string, string | boolean>,
    live: () => Promise<DataFetcherResponse<T>>
): Promise<DataFetcherResponse<T>> {
    const { siteRevision } = input;
    if (!siteRevision || (spaceId && siteRevision.spaceIds?.includes(spaceId) === false)) {
        return live();
    }

    const { spaceIds: _spaceIds, ...cacheableSiteRevision } = siteRevision;
    // Typed like the space endpoint it mirrors: the API client doesn't publish these endpoints yet.
    return (await getAtSiteRevision(
        { ...input, siteRevision: cacheableSiteRevision },
        { path, query }
    )) as DataFetcherResponse<T>;
}

/**
 * Get content at a site revision. It never changes, so it is cached forever.
 */
const getAtSiteRevision = cache(
    async (
        input: DataFetcherInput,
        params: { path: string; query: Record<string, string | boolean> }
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            const { siteRevision } = input;
            if (!siteRevision) {
                throw new Error('A site revision is required to read content at it');
            }
            const { organizationId, siteId, siteRevisionId } = siteRevision;
            const path = `/orgs/${organizationId}/sites/${siteId}/revisions/${siteRevisionId}/${params.path}`;

            return trace(`getAtSiteRevision(${path})`, async () => {
                const api = apiClient(input);
                const res = await api.request<unknown>({
                    path,
                    method: 'GET',
                    query: params.query,
                    secure: true,
                    format: 'json',
                    ...noCacheFetchOptions,
                });
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('max');
                return res.data;
            });
        });
    }
);

/**
 * Infer the cache life from the api response headers.
 * @param response The response from the API call.
 * @param defaultCacheLife The default cache life to use if not specified in the response.
 * @returns nothing
 */
function cacheLifeFromResponse(
    response: HttpResponse<unknown, unknown>,
    defaultCacheLife: 'days' | 'max' | 'hours' | 'minutes' | 'seconds'
) {
    const cacheControlHeader = response.headers.get('x-gitbook-cache-control');
    const parsed = parseCacheControl(cacheControlHeader || '');
    const maxAge = parsed?.maxAge ?? parsed?.sharedMaxAge;
    if (maxAge) {
        return cacheLife({
            stale: 60 * 5, // This one is only for the client,
            revalidate: maxAge, // revalidate and expire are the same, we don't want stale data here
            expire: maxAge,
        });
    }
    // Typings in Next is "wrong" and does not allow us just use it as `cacheLife(defaultCacheLife)`
    switch (defaultCacheLife) {
        case 'days':
            return cacheLife('days');
        case 'max':
            return cacheLife('max');
        case 'hours':
            return cacheLife('hours');
        case 'minutes':
            return cacheLife('minutes');
        case 'seconds':
            return cacheLife('seconds');
        default:
            throw new Error(`Unknown default cache life: ${defaultCacheLife}`);
    }
}

const getUserById = cache(async (input: DataFetcherInput, params: { userId: string }) => {
    'use cache';
    return wrapDataFetcherError(async () => {
        return trace(`getUserById(${params.userId})`, async () => {
            const api = apiClient(input);
            const res = await api.users.getUserById(params.userId, {
                ...noCacheFetchOptions,
            });
            cacheTag(...getCacheTagsFromResponse(res));
            cacheLife('days');
            return res.data;
        });
    });
});

const getSpace = cache(
    async (input: DataFetcherInput, params: { spaceId: string; shareKey: string | undefined }) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'space',
                space: params.spaceId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(`getSpace(${params.spaceId}, ${params.shareKey})`, async () => {
                const api = apiClient(input);
                const res = await api.spaces.getSpaceById(
                    params.spaceId,
                    {
                        shareKey: params.shareKey,
                    },
                    {
                        ...noCacheFetchOptions,
                    }
                );
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
                return res.data;
            });
        });
    }
);

const getChangeRequest = cache(
    async (input: DataFetcherInput, params: { spaceId: string; changeRequestId: string }) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'change-request',
                space: params.spaceId,
                changeRequest: params.changeRequestId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getChangeRequest(${params.spaceId}, ${params.changeRequestId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getChangeRequestById(
                        params.spaceId,
                        params.changeRequestId,
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('minutes');
                    return res.data;
                }
            );
        });
    }
);

// We don't use remote cache on vercel because of the 2Mb limit on cache size that makes some route crash
const getRevision = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; metadata: boolean }
    ) => {
        'use cache';
        if (params.metadata) {
            // Git paths can change without changing the content revision.
            cacheTag(getCacheTag({ tag: 'space', space: params.spaceId }));
        }
        return wrapDataFetcherError(async () => {
            return trace(`getRevision(${params.spaceId}, ${params.revisionId})`, async () => {
                const api = apiClient(input);
                const res = await api.spaces.getRevisionById(
                    params.spaceId,
                    params.revisionId,
                    {
                        metadata: params.metadata,
                    },
                    {
                        ...noCacheFetchOptions,
                    }
                );
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('max');
                return res.data;
            });
        });
    }
);

const getChangeRequestChanges = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; changeRequestId: string; limit?: number }
    ) => {
        'use cache: remote';
        cacheTag(
            getCacheTag({
                tag: 'change-request',
                space: params.spaceId,
                changeRequest: params.changeRequestId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getChangeRequestChanges(${params.spaceId}, ${params.changeRequestId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getChangeRequestChanges(
                        params.spaceId,
                        params.changeRequestId,
                        {
                            limit: params.limit,
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('minutes');
                    return res.data;
                }
            );
        });
    }
);

const getRevisionSemanticChanges = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; limit?: number }
    ) => {
        'use cache: remote';
        return wrapDataFetcherError(async () => {
            return trace(
                `getRevisionSemanticChanges(${params.spaceId}, ${params.revisionId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getRevisionSemanticChanges(
                        params.spaceId,
                        params.revisionId,
                        {
                            computed: false,
                            limit: params.limit,
                            metadata: false,
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                    return res.data;
                }
            );
        });
    }
);

const getRevisionPageMarkdown = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string },
        // used only to bust the cache
        _functionName: string
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(
                `getRevisionPageMarkdown(${params.spaceId}, ${params.revisionId}, ${params.pageId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getPageInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.pageId,
                        {
                            format: 'markdown',
                            'format.markdown.refs': 'stable',
                            evaluated: 'deterministic-only',
                            metadata: false,
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );

                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');

                    if (!('markdown' in res.data)) {
                        throw new DataFetcherError('Page is not a document', 404);
                    }
                    return res.data.markdown;
                }
            );
        });
    }
);

/**
 * Get the document for a page.
 */
const getRevisionPageDocument = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string },
        // used only to bust the cache
        _functionName: string
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(
                `getRevisionPageDocument(${params.spaceId}, ${params.revisionId}, ${params.pageId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getPageDocumentInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.pageId,
                        {
                            evaluated: 'deterministic-only',
                            dereferenced: 'reusable-contents',
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );

                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLifeFromResponse(res, 'max');

                    return res.data;
                }
            );
        });
    }
);

const getRevisionReusableContentDocument = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; reusableContentId: string }
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(
                `getRevisionReusableContentDocument(${params.spaceId}, ${params.revisionId}, ${params.reusableContentId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getReusableContentDocumentInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.reusableContentId,
                        {
                            evaluated: 'deterministic-only',
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );

                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLifeFromResponse(res, 'max');

                    return res.data;
                }
            );
        });
    }
);

const getRevisionPageByPath = cache(
    async (
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            path: string;
            metadata?: boolean;
            cachedMetadata?: boolean;
        }
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(
                `getRevisionPageByPath(${params.spaceId}, ${params.revisionId}, ${params.path})`,
                async () => {
                    const encodedPath = encodeURIComponent(params.path);
                    const api = apiClient(input);
                    const query = {
                        metadata: params.metadata ?? false,
                        cachedMetadata: params.cachedMetadata ?? false,
                    };
                    const res = await api.spaces.getPageInRevisionByPath(
                        params.spaceId,
                        params.revisionId,
                        encodedPath,
                        query,
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                    return res.data;
                }
            );
        });
    }
);

const getDocument = cache(
    async (input: DataFetcherInput, params: { spaceId: string; documentId: string }) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(`getDocument(${params.spaceId}, ${params.documentId})`, async () => {
                const api = apiClient(input);
                const res = await api.spaces.getDocumentById(
                    params.spaceId,
                    params.documentId,
                    {},
                    {
                        ...noCacheFetchOptions,
                    }
                );
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLifeFromResponse(res, 'max');
                return res.data;
            });
        });
    }
);

const getComputedDocument = cache(
    async (
        input: DataFetcherInput,
        params: {
            spaceId: string;
            organizationId: string;
            source: ComputedContentSource;
            seed: string;
        }
    ) => {
        'use cache';
        cacheTag(
            ...getComputedContentSourceCacheTags(
                {
                    spaceId: params.spaceId,
                    organizationId: params.organizationId,
                },
                params.source
            )
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getComputedDocument(${params.spaceId}, ${params.organizationId}, ${params.source.type}, ${params.seed})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getComputedDocument(
                        params.spaceId,
                        {
                            source: params.source,
                            seed: params.seed,
                        },
                        {},
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLifeFromResponse(res, 'max');
                    return res.data;
                }
            );
        });
    }
);

// We don't use remote cache on vercel because of the 2Mb limit on cache size that makes some route crash
const getLatestOpenAPISpecVersionContent = cache(
    async (input: DataFetcherInput, params: { organizationId: string; slug: string }) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'openapi',
                organization: params.organizationId,
                openAPISpec: params.slug,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getLatestOpenAPISpecVersionContent(${params.organizationId}, ${params.slug})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getLatestOpenApiSpecVersionContent(
                        params.organizationId,
                        params.slug,
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                    return res.data;
                }
            );
        });
    }
);

const getPublishedContentSite = cache(
    async (
        input: DataFetcherInput,
        params: { organizationId: string; siteId: string; siteShareKey: string | undefined },
        _apiVersion: string
    ) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getPublishedContentSite(${params.organizationId}, ${params.siteId}, ${params.siteShareKey})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getPublishedContentSite(
                        params.organizationId,
                        params.siteId,
                        {
                            shareKey: params.siteShareKey,
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLifeFromResponse(res, 'days');
                    return res.data;
                }
            );
        });
    }
);

const getSiteRedirectBySource = cache(
    async (
        input: DataFetcherInput,
        params: {
            organizationId: string;
            siteId: string;
            siteShareKey: string | undefined;
            source: string;
        }
    ) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(
                `getSiteRedirectBySource(${params.organizationId}, ${params.siteId}, ${params.siteShareKey}, ${params.source})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getSiteRedirectBySource(
                        params.organizationId,
                        params.siteId,
                        {
                            shareKey: params.siteShareKey,
                            source: params.source,
                        },
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('days');
                    return res.data;
                }
            );
        });
    }
);

const getEmbedByUrl = cache(
    async (input: DataFetcherInput, params: { spaceId: string; url: string }) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'space',
                space: params.spaceId,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(`getEmbedByUrl(${params.spaceId}, ${params.url})`, async () => {
                const api = apiClient(input);
                const res = await api.spaces.getEmbedByUrlInSpace(
                    params.spaceId,
                    {
                        url: params.url,
                    },
                    {
                        ...noCacheFetchOptions,
                    }
                );
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('weeks');
                return res.data;
            });
        });
    }
);

async function searchSiteContent(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
) {
    return wrapDataFetcherError(async () => {
        return trace(
            `searchSiteContent(${params.organizationId}, ${params.siteId}, ${params.query})`,
            async () => {
                const { organizationId, siteId, query, scope } = params;
                const api = apiClient(input);
                const res = await api.orgs.searchSiteContent(
                    organizationId,
                    siteId,
                    {
                        query,
                        ...(scope.mode === 'current' && scope.restrictTo
                            ? {
                                  // `restrictTo` only exists in the newer `scope` request shape,
                                  // and the published @gitbook/api types don't include it yet.
                                  scope: {
                                      mode: 'default',
                                      currentSiteSpace: scope.siteSpaceId,
                                      restrictTo: scope.restrictTo,
                                  } as SiteSearchScope,
                              }
                            : scope),
                    },
                    {},
                    {
                        ...noCacheFetchOptions,
                    }
                );
                return res.data.items;
            }
        );
    });
}

const renderIntegrationUi = cache(
    async (
        input: DataFetcherInput,
        params: { integrationName: string; request: RenderIntegrationUI }
    ) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'integration',
                integration: params.integrationName,
            })
        );

        return wrapDataFetcherError(async () => {
            return trace(`renderIntegrationUi(${params.integrationName})`, async () => {
                const api = apiClient(input);
                const res = await api.integrations.renderIntegrationUiWithPost(
                    params.integrationName,
                    params.request,
                    {
                        ...noCacheFetchOptions,
                    }
                );
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
                return res.data;
            });
        });
    }
);

/**
 * List all the meta links for a given page in a revision.
 */
const listRevisionPageMetaLinks = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string }
    ) => {
        'use cache';
        return wrapDataFetcherError(async () => {
            return trace(
                `listRevisionPageMetaLinks(${params.spaceId}, ${params.revisionId}, ${params.pageId})`,
                async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.listRevisionPageMetaLinks(
                        params.spaceId,
                        params.revisionId,
                        params.pageId,
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('days');
                    return res.data;
                }
            );
        });
    }
);

/**
 * Create a new API client.
 */
export function apiClient(input: DataFetcherInput = { apiToken: null }) {
    const { apiToken } = input;

    const api = new GitBookAPI({
        authToken: apiToken || GITBOOK_API_TOKEN || undefined,
        endpoint: GITBOOK_API_URL,
        userAgent: GITBOOK_USER_AGENT,
    });

    return api;
}

/**
 * Get the tags from the API responses.
 */
function getCacheTagsFromResponse(response: HttpResponse<unknown, unknown>) {
    const cacheTagHeader = response.headers.get('x-gitbook-cache-tag');
    const tags = !cacheTagHeader ? [] : cacheTagHeader.split(',');
    return tags;
}
