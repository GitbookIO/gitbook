import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type HttpResponse,
    type RenderIntegrationUI,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
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

const getUserById = withCacheKey(
    withoutConcurrentExecution(async (_, input: DataFetcherInput, params: { userId: string }) => {
        'use cache';
        return trace(`getUserById(${params.userId})`, async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.users.getUserById(params.userId, {
                    ...noCacheFetchOptions,
                });
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
                return res.data;
            });
        });
    })
);

const getSpace = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; shareKey: string | undefined }
        ) => {
            'use cache';
            cacheTag(
                getCacheTag({
                    tag: 'space',
                    space: params.spaceId,
                })
            );

            return trace(`getSpace(${params.spaceId}, ${params.shareKey})`, async () => {
                return wrapDataFetcherError(async () => {
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
    )
);

const getChangeRequest = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; changeRequestId: string }
        ) => {
            'use cache';
            cacheTag(
                getCacheTag({
                    tag: 'change-request',
                    space: params.spaceId,
                    changeRequest: params.changeRequestId,
                })
            );

            return trace(
                `getChangeRequest(${params.spaceId}, ${params.changeRequestId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getRevision = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; metadata: boolean }
        ) => {
            'use cache';
            return trace(`getRevision(${params.spaceId}, ${params.revisionId})`, async () => {
                return wrapDataFetcherError(async () => {
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
    )
);

const getRevisionPages = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; metadata: boolean }
        ) => {
            'use cache';
            return trace(`getRevisionPages(${params.spaceId}, ${params.revisionId})`, async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.listPagesInRevisionById(
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
                    return res.data.pages;
                });
            });
        }
    )
);

const getRevisionFile = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; fileId: string }
        ) => {
            'use cache';
            return trace(
                `getRevisionFile(${params.spaceId}, ${params.revisionId}, ${params.fileId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
                        const api = apiClient(input);
                        const res = await api.spaces.getFileInRevisionById(
                            params.spaceId,
                            params.revisionId,
                            params.fileId,
                            {},
                            {
                                ...noCacheFetchOptions,
                            }
                        );
                        cacheTag(...getCacheTagsFromResponse(res));
                        cacheLife('max');
                        return res.data;
                    });
                }
            );
        }
    )
);

const getRevisionPageMarkdown = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; pageId: string }
        ) => {
            'use cache';
            return trace(
                `getRevisionPageMarkdown(${params.spaceId}, ${params.revisionId}, ${params.pageId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getRevisionPageByPath = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; path: string }
        ) => {
            'use cache';
            return trace(
                `getRevisionPageByPath(${params.spaceId}, ${params.revisionId}, ${params.path})`,
                async () => {
                    const encodedPath = encodeURIComponent(params.path);
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getDocument = withCacheKey(
    withoutConcurrentExecution(
        async (_, input: DataFetcherInput, params: { spaceId: string; documentId: string }) => {
            'use cache';
            return trace(`getDocument(${params.spaceId}, ${params.documentId})`, async () => {
                return wrapDataFetcherError(async () => {
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
                    cacheLife('max');
                    return res.data;
                });
            });
        }
    )
);

const getComputedDocument = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
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

            return trace(
                `getComputedDocument(${params.spaceId}, ${params.organizationId}, ${params.source.type}, ${params.seed})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                        cacheLife('max');
                        return res.data;
                    });
                }
            );
        }
    )
);

const getReusableContent = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; reusableContentId: string }
        ) => {
            'use cache';
            return trace(
                `getReusableContent(${params.spaceId}, ${params.revisionId}, ${params.reusableContentId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
                        const api = apiClient(input);
                        const res = await api.spaces.getReusableContentInRevisionById(
                            params.spaceId,
                            params.revisionId,
                            params.reusableContentId,
                            {},
                            {
                                ...noCacheFetchOptions,
                            }
                        );
                        cacheTag(...getCacheTagsFromResponse(res));
                        cacheLife('max');
                        return res.data;
                    });
                }
            );
        }
    )
);

const getLatestOpenAPISpecVersionContent = withCacheKey(
    withoutConcurrentExecution(
        async (_, input: DataFetcherInput, params: { organizationId: string; slug: string }) => {
            'use cache';
            cacheTag(
                getCacheTag({
                    tag: 'openapi',
                    organization: params.organizationId,
                    openAPISpec: params.slug,
                })
            );

            return trace(
                `getLatestOpenAPISpecVersionContent(${params.organizationId}, ${params.slug})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getPublishedContentSite = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
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

            return trace(
                `getPublishedContentSite(${params.organizationId}, ${params.siteId}, ${params.siteShareKey})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getSiteRedirectBySource = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
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

            return trace(
                `getSiteRedirectBySource(${params.organizationId}, ${params.siteId}, ${params.siteShareKey}, ${params.source})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const getEmbedByUrl = withCacheKey(
    withoutConcurrentExecution(
        async (_, input: DataFetcherInput, params: { spaceId: string; url: string }) => {
            'use cache';
            cacheTag(
                getCacheTag({
                    tag: 'space',
                    space: params.spaceId,
                })
            );

            return trace(`getEmbedByUrl(${params.spaceId}, ${params.url})`, async () => {
                return wrapDataFetcherError(async () => {
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
    )
);

const searchSiteContent = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
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

            return trace(
                `searchSiteContent(${params.organizationId}, ${params.siteId}, ${params.query})`,
                async () => {
                    return wrapDataFetcherError(async () => {
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
                    });
                }
            );
        }
    )
);

const renderIntegrationUi = withCacheKey(
    withoutConcurrentExecution(
        async (
            _,
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

            return trace(`renderIntegrationUi(${params.integrationName})`, async () => {
                return wrapDataFetcherError(async () => {
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
    )
);

async function* streamAIResponse(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['streamAIResponse']>[0]
) {
    const api = apiClient(input);
    const res = await api.orgs.streamAiResponseInSite(
        params.organizationId,
        params.siteId,
        {
            input: params.input,
            output: params.output,
            model: params.model,
        },
        {
            ...noCacheFetchOptions,
        }
    );

    for await (const event of res) {
        yield event;
    }
}

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
