import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type GitBookAPIServiceBinding,
    type RenderIntegrationUI,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cache } from 'next/cache';
import { getCloudflareContext, getCloudflareRequestGlobal } from './cloudflare';
import { DataFetcherError, wrapDataFetcherError } from './errors';
import { withCacheKey, withoutConcurrentExecution } from './memoize';
import type { GitBookDataFetcher } from './types';

interface DataFetcherInput {
    /**
     * API token.
     */
    apiToken: string | null;
}

/**
 * Revalidation profile for the cache.
 * Based on https://nextjs.org/docs/app/api-reference/functions/cacheLife#default-cache-profiles
 */
enum RevalidationProfile {
    minutes = 60,
    hours = 60 * 60,
    days = 60 * 60 * 24,
    weeks = 60 * 60 * 24 * 7,
    max = 60 * 60 * 24 * 30,
}

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
            return trace('getPublishedContentSite', () =>
                getPublishedContentSite(input, {
                    organizationId: params.organizationId,
                    siteId: params.siteId,
                    siteShareKey: params.siteShareKey,
                })
            );
        },
        getSiteRedirectBySource(params) {
            return trace('getSiteRedirectBySource', () =>
                getSiteRedirectBySource(input, {
                    organizationId: params.organizationId,
                    siteId: params.siteId,
                    siteShareKey: params.siteShareKey,
                    source: params.source,
                })
            );
        },
        getRevision(params) {
            return trace('getRevision', () =>
                getRevision(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    metadata: params.metadata,
                })
            );
        },
        getRevisionPages(params) {
            return trace('getRevisionPages', () =>
                getRevisionPages(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    metadata: params.metadata,
                })
            );
        },
        getRevisionFile(params) {
            return trace('getRevisionFile', () =>
                getRevisionFile(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    fileId: params.fileId,
                })
            );
        },
        getRevisionPageByPath(params) {
            return trace('getRevisionPageByPath', () =>
                getRevisionPageByPath(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    path: params.path,
                })
            );
        },
        getRevisionPageMarkdown(params) {
            return trace('getRevisionPageMarkdown', () =>
                getRevisionPageMarkdown(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    pageId: params.pageId,
                })
            );
        },
        getReusableContent(params) {
            return trace('getReusableContent', () =>
                getReusableContent(input, {
                    spaceId: params.spaceId,
                    revisionId: params.revisionId,
                    reusableContentId: params.reusableContentId,
                })
            );
        },
        getLatestOpenAPISpecVersionContent(params) {
            return trace('getLatestOpenAPISpecVersionContent', () =>
                getLatestOpenAPISpecVersionContent(input, {
                    organizationId: params.organizationId,
                    slug: params.slug,
                })
            );
        },
        getSpace(params) {
            return trace('getSpace', () =>
                getSpace(input, {
                    spaceId: params.spaceId,
                    shareKey: params.shareKey,
                })
            );
        },
        getChangeRequest(params) {
            return trace('getChangeRequest', () =>
                getChangeRequest(input, {
                    spaceId: params.spaceId,
                    changeRequestId: params.changeRequestId,
                })
            );
        },
        getDocument(params) {
            return trace('getDocument', () =>
                getDocument(input, {
                    spaceId: params.spaceId,
                    documentId: params.documentId,
                })
            );
        },
        getComputedDocument(params) {
            return trace('getComputedDocument', () =>
                getComputedDocument(input, {
                    organizationId: params.organizationId,
                    spaceId: params.spaceId,
                    source: params.source,
                    seed: params.seed,
                })
            );
        },
        getEmbedByUrl(params) {
            return trace('getEmbedByUrl', () =>
                getEmbedByUrl(input, {
                    url: params.url,
                    spaceId: params.spaceId,
                })
            );
        },
        searchSiteContent(params) {
            return trace('searchSiteContent', () => searchSiteContent(input, params));
        },

        renderIntegrationUi(params) {
            return trace('renderIntegrationUi', () =>
                renderIntegrationUi(input, {
                    integrationName: params.integrationName,
                    request: params.request,
                })
            );
        },

        getUserById(userId) {
            return trace('getUserById', () => getUserById(input, { userId }));
        },

        streamAIResponse(params) {
            return streamAIResponse(input, params);
        },
    };
}

/*
 * For the following functions, we:
 * - Wrap them with `withCacheKey` to compute a cache key from the function arguments ONCE (to be performant)
 * - Pass the cache key to `unstable_cache` to ensure the cache is not tied to closures
 * - Call the uncached function in a `withoutConcurrentExecution` wrapper to prevent concurrent executions
 *
 * Important:
 * - Only the function inside the `unstable_cache` is wrapped in `withoutConcurrentExecution` as Next.js needs to call
 *   the return of `unstable_cache` to identify the tags.
 */

const getUserById = withCacheKey(
    async (cacheKey, input: DataFetcherInput, params: { userId: string }) => {
        const uncached = unstable_cache(
            async () => {
                return getUserByIdUncached(cacheKey, input, params);
            },
            [cacheKey],
            {
                revalidate: RevalidationProfile.days,
                tags: [],
            }
        );

        return uncached();
    }
);

const getUserByIdUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { userId: string }) => {
        return trace(`getUserById.uncached(${params.userId})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.users.getUserById(params.userId);
                return res.data;
            });
        });
    }
);

const getSpace = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            shareKey: string | undefined;
        }
    ) => {
        const uncached = unstable_cache(
            async () => {
                return getSpaceUncached(cacheKey, input, params);
            },
            [cacheKey],
            {
                revalidate: RevalidationProfile.days,
                tags: [
                    getCacheTag({
                        tag: 'space',
                        space: params.spaceId,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const getSpaceUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { spaceId: string; shareKey: string | undefined }) => {
        return trace(`getSpace.uncached(${params.spaceId}, ${params.shareKey})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getSpaceById(params.spaceId, {
                    shareKey: params.shareKey,
                });
                return res.data;
            });
        });
    }
);

const getChangeRequest = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            changeRequestId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getChangeRequestUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.minutes * 5,
                tags: [
                    getCacheTag({
                        tag: 'change-request',
                        space: params.spaceId,
                        changeRequest: params.changeRequestId,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const getChangeRequestUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { spaceId: string; changeRequestId: string }) => {
        return trace(
            `getChangeRequest.uncached(${params.spaceId}, ${params.changeRequestId})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getChangeRequestById(
                        params.spaceId,
                        params.changeRequestId
                    );
                    return res.data;
                });
            }
        );
    }
);

const getRevision = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            metadata: boolean;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getRevisionUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getRevisionUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; metadata: boolean }
    ) => {
        return trace(`getRevision.uncached(${params.spaceId}, ${params.revisionId})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getRevisionById(params.spaceId, params.revisionId, {
                    metadata: params.metadata,
                });
                return res.data;
            });
        });
    }
);

const getRevisionPages = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            metadata: boolean;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getRevisionPagesUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getRevisionPagesUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; metadata: boolean }
    ) => {
        return trace(
            `getRevisionPages.uncached(${params.spaceId}, ${params.revisionId})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.listPagesInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        {
                            metadata: params.metadata,
                            computed: false,
                        }
                    );
                    return res.data.pages;
                });
            }
        );
    }
);

const getRevisionFile = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            fileId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getRevisionFileUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getRevisionFileUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; fileId: string }
    ) => {
        return trace(
            `getRevisionFile.uncached(${params.spaceId}, ${params.revisionId}, ${params.fileId})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getFileInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.fileId,
                        {}
                    );
                    return res.data;
                });
            }
        );
    }
);

const getRevisionPageMarkdown = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            pageId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getRevisionPageMarkdownUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getRevisionPageMarkdownUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; pageId: string }
    ) => {
        return trace(
            `getRevisionPageMarkdown.uncached(${params.spaceId}, ${params.revisionId}, ${params.pageId})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getPageInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.pageId,
                        {
                            format: 'markdown',
                        }
                    );
                    if (!('markdown' in res.data)) {
                        throw new DataFetcherError('Page is not a document', 404);
                    }
                    return res.data.markdown;
                });
            }
        );
    }
);

const getRevisionPageByPath = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            path: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getRevisionPageByPathUncached(cacheKey, input, params),
            [cacheKey, 'v2'],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getRevisionPageByPathUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; path: string }
    ) => {
        return trace(
            `getRevisionPageByPath.uncached(${params.spaceId}, ${params.revisionId}, ${params.path})`,
            async () => {
                const encodedPath = encodeURIComponent(params.path);
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getPageInRevisionByPath(
                        params.spaceId,
                        params.revisionId,
                        encodedPath,
                        {}
                    );
                    return res.data;
                });
            }
        );
    }
);

const getDocument = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            documentId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getDocumentUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getDocumentUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { spaceId: string; documentId: string }) => {
        return trace(`getDocument.uncached(${params.spaceId}, ${params.documentId})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getDocumentById(params.spaceId, params.documentId, {});
                return res.data;
            });
        });
    }
);

const getComputedDocument = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            organizationId: string;
            source: ComputedContentSource;
            seed: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getComputedDocumentUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: getComputedContentSourceCacheTags(
                    {
                        spaceId: params.spaceId,
                        organizationId: params.organizationId,
                    },
                    params.source
                ),
            }
        );

        return uncached();
    }
);

const getComputedDocumentUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: {
            spaceId: string;
            organizationId: string;
            source: ComputedContentSource;
            seed: string;
        }
    ) => {
        return trace(
            `getComputedDocument.uncached(${params.spaceId}, ${params.organizationId}, ${params.source.type}, ${params.seed})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getComputedDocument(params.spaceId, {
                        source: params.source,
                        seed: params.seed,
                    });
                    return res.data;
                });
            }
        );
    }
);

const getReusableContent = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            spaceId: string;
            revisionId: string;
            reusableContentId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getReusableContentUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [],
            }
        );

        return uncached();
    }
);

const getReusableContentUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { spaceId: string; revisionId: string; reusableContentId: string }
    ) => {
        return trace(
            `getReusableContent.uncached(${params.spaceId}, ${params.revisionId}, ${params.reusableContentId})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getReusableContentInRevisionById(
                        params.spaceId,
                        params.revisionId,
                        params.reusableContentId
                    );
                    return res.data;
                });
            }
        );
    }
);

const getLatestOpenAPISpecVersionContent = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            organizationId: string;
            slug: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getLatestOpenAPISpecVersionContentUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.max,
                tags: [
                    getCacheTag({
                        tag: 'openapi',
                        organization: params.organizationId,
                        openAPISpec: params.slug,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const getLatestOpenAPISpecVersionContentUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { organizationId: string; slug: string }) => {
        return trace(
            `getLatestOpenAPISpecVersionContent.uncached(${params.organizationId}, ${params.slug})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getLatestOpenApiSpecVersionContent(
                        params.organizationId,
                        params.slug
                    );
                    return res.data;
                });
            }
        );
    }
);

const getPublishedContentSite = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            organizationId: string;
            siteId: string;
            siteShareKey: string | undefined;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getPublishedContentSiteUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.days,
                tags: [
                    getCacheTag({
                        tag: 'site',
                        site: params.siteId,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const getPublishedContentSiteUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { organizationId: string; siteId: string; siteShareKey: string | undefined }
    ) => {
        return trace(
            `getPublishedContentSite.uncached(${params.organizationId}, ${params.siteId}, ${params.siteShareKey})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getPublishedContentSite(
                        params.organizationId,
                        params.siteId,
                        {
                            shareKey: params.siteShareKey,
                        }
                    );
                    return res.data;
                });
            }
        );
    }
);

const getSiteRedirectBySource = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            organizationId: string;
            siteId: string;
            siteShareKey: string | undefined;
            source: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getSiteRedirectBySourceUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.days,
                tags: [
                    getCacheTag({
                        tag: 'site',
                        site: params.siteId,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const getSiteRedirectBySourceUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: {
            organizationId: string;
            siteId: string;
            siteShareKey: string | undefined;
            source: string;
        }
    ) => {
        return trace(
            `getSiteRedirectBySource.uncached(${params.organizationId}, ${params.siteId}, ${params.siteShareKey}, ${params.source})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.orgs.getSiteRedirectBySource(
                        params.organizationId,
                        params.siteId,
                        {
                            shareKey: params.siteShareKey,
                            source: params.source,
                        }
                    );
                    return res.data;
                });
            }
        );
    }
);

const getEmbedByUrl = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            url: string;
            spaceId: string;
        }
    ) => {
        const uncached = unstable_cache(
            async () => getEmbedByUrlUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.weeks,
                tags: [],
            }
        );

        return uncached();
    }
);

const getEmbedByUrlUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (input: DataFetcherInput, params: { spaceId: string; url: string }) => {
        return trace(`getEmbedByUrl.uncached(${params.spaceId}, ${params.url})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getEmbedByUrlInSpace(params.spaceId, {
                    url: params.url,
                });
                return res.data;
            });
        });
    }
);

const searchSiteContent = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
    ) => {
        const uncached = unstable_cache(
            async () => searchSiteContentUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.hours,
                tags: [],
            }
        );

        return uncached();
    }
);

const searchSiteContentUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
    ) => {
        return trace(
            `searchSiteContent.uncached(${params.organizationId}, ${params.siteId}, ${params.query})`,
            async () => {
                return wrapDataFetcherError(async () => {
                    const { organizationId, siteId, query, scope } = params;
                    const api = apiClient(input);
                    const res = await api.orgs.searchSiteContent(organizationId, siteId, {
                        query,
                        ...scope,
                    });
                    return res.data.items;
                });
            }
        );
    }
);

const renderIntegrationUi = withCacheKey(
    async (
        cacheKey,
        input: DataFetcherInput,
        params: {
            integrationName: string;
            request: RenderIntegrationUI;
        }
    ) => {
        const uncached = unstable_cache(
            async () => renderIntegrationUiUncached(cacheKey, input, params),
            [cacheKey],
            {
                revalidate: RevalidationProfile.days,
                tags: [
                    getCacheTag({
                        tag: 'integration',
                        integration: params.integrationName,
                    }),
                ],
            }
        );

        return uncached();
    }
);

const renderIntegrationUiUncached = withoutConcurrentExecution(
    getCloudflareRequestGlobal,
    async (
        input: DataFetcherInput,
        params: { integrationName: string; request: RenderIntegrationUI }
    ) => {
        return trace(`renderIntegrationUi.uncached(${params.integrationName})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.integrations.renderIntegrationUiWithPost(
                    params.integrationName,
                    params.request
                );
                return res.data;
            });
        });
    }
);

async function* streamAIResponse(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['streamAIResponse']>[0]
) {
    const api = apiClient(input);
    const res = await api.orgs.streamAiResponseInSite(params.organizationId, params.siteId, {
        input: params.input,
        output: params.output,
        model: params.model,
    });

    for await (const event of res) {
        yield event;
    }
}

let loggedServiceBinding = false;

/**
 * Create a new API client.
 */
export function apiClient(input: DataFetcherInput = { apiToken: null }) {
    const { apiToken } = input;
    let serviceBinding: GitBookAPIServiceBinding | undefined;

    const cloudflareContext = getCloudflareContext();
    if (cloudflareContext) {
        // @ts-expect-error
        serviceBinding = cloudflareContext.env.GITBOOK_API as GitBookAPIServiceBinding | undefined;
        if (!loggedServiceBinding) {
            loggedServiceBinding = true;
            if (serviceBinding) {
                // biome-ignore lint/suspicious/noConsole: we want to log here
                console.log(`using service binding for the API (${GITBOOK_API_URL})`);
            } else {
                // biome-ignore lint/suspicious/noConsole: we want to log here
                console.warn(`no service binding for the API (${GITBOOK_API_URL})`);
            }
        }
    }

    const api = new GitBookAPI({
        authToken: apiToken || GITBOOK_API_TOKEN || undefined,
        endpoint: GITBOOK_API_URL,
        userAgent: GITBOOK_USER_AGENT,
        serviceBinding,
    });

    return api;
}
