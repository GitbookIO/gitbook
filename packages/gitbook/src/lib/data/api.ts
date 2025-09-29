import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@/lib/env';
import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type HttpResponse,
    type RenderIntegrationUI,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';
import { parse as parseCacheControl } from '@tusbar/cache-control';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { cache } from '../cache';
import { DataFetcherError, wrapCacheDataFetcherError } from './errors';
import type { GitBookDataFetcher } from './types';

interface DataFetcherInput {
    /**
     * API token.
     */
    apiToken: string | null;
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
                apiToken,
            });
        },

        //
        // API that are tied to the token
        //
        getPublishedContentSite(params) {
            return getPublishedContentSite(input, {
                organizationId: params.organizationId,
                siteId: params.siteId,
                siteShareKey: params.siteShareKey,
            });
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
            return getRevision(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
            });
        },
        getRevisionPageByPath(params) {
            return getRevisionPageByPath(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                path: params.path,
            });
        },
        getRevisionPageMarkdown(params) {
            return getRevisionPageMarkdown(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                pageId: params.pageId,
            });
        },
        getRevisionPageDocument(params) {
            return getRevisionPageDocument(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                pageId: params.pageId,
            });
        },
        getRevisionReusableContentDocument(params) {
            return getRevisionReusableContentDocument(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                reusableContentId: params.reusableContentId,
            });
        },
        getLatestOpenAPISpecVersionContent(params) {
            return getLatestOpenAPISpecVersionContent(input, {
                organizationId: params.organizationId,
                slug: params.slug,
            });
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
    };
}

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
    return wrapCacheDataFetcherError(async () => {
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

        return wrapCacheDataFetcherError(async () => {
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

        return wrapCacheDataFetcherError(async () => {
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

const getRevision = cache(
    async (input: DataFetcherInput, params: { spaceId: string; revisionId: string }) => {
        'use cache';
        return wrapCacheDataFetcherError(async () => {
            return trace(`getRevision(${params.spaceId}, ${params.revisionId})`, async () => {
                const api = apiClient(input);
                const res = await api.spaces.getRevisionById(
                    params.spaceId,
                    params.revisionId,
                    {
                        metadata: true,
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

const getRevisionPageMarkdown = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string }
    ) => {
        'use cache';
        return wrapCacheDataFetcherError(async () => {
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

const getRevisionPageDocument = cache(
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string }
    ) => {
        'use cache';
        return wrapCacheDataFetcherError(async () => {
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
        return wrapCacheDataFetcherError(async () => {
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
        params: { spaceId: string; revisionId: string; path: string }
    ) => {
        'use cache';
        return wrapCacheDataFetcherError(async () => {
            return trace(
                `getRevisionPageByPath(${params.spaceId}, ${params.revisionId}, ${params.path})`,
                async () => {
                    const encodedPath = encodeURIComponent(params.path);
                    const api = apiClient(input);
                    const res = await api.spaces.getPageInRevisionByPath(
                        params.spaceId,
                        params.revisionId,
                        encodedPath,
                        {},
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
        return wrapCacheDataFetcherError(async () => {
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

        return wrapCacheDataFetcherError(async () => {
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

        return wrapCacheDataFetcherError(async () => {
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
        params: { organizationId: string; siteId: string; siteShareKey: string | undefined }
    ) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );

        return wrapCacheDataFetcherError(async () => {
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
                    cacheLife('days');
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

        return wrapCacheDataFetcherError(async () => {
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

        return wrapCacheDataFetcherError(async () => {
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

const searchSiteContent = cache(
    async (
        input: DataFetcherInput,
        params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
    ) => {
        'use cache';
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );

        return wrapCacheDataFetcherError(async () => {
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
                            ...scope,
                        },
                        {},
                        {
                            ...noCacheFetchOptions,
                        }
                    );
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('hours');
                    return res.data.items;
                }
            );
        });
    }
);

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

        return wrapCacheDataFetcherError(async () => {
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
