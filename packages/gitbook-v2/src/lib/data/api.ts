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
import { getCloudflareContext } from './cloudflare';
import { DataFetcherError, wrapDataFetcherError } from './errors';
import { getCacheKey, memoize } from './memoize';
import type { GitBookDataFetcher } from './types';

interface DataFetcherInput {
    /**
     * API token.
     */
    apiToken: string | null;
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

const getUserById = memoize(async function getUserById(
    input: DataFetcherInput,
    params: { userId: string }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(`getUserById.uncached(${params.userId})`, async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.users.getUserById(params.userId);
                    return res.data;
                });
            });
        },
        [input.apiToken ?? '', params.userId],
        {
            revalidate: 60 * 60 * 24,
            tags: [],
        }
    );

    return uncached();
});

const getSpace = memoize(async function getSpace(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        shareKey: string | undefined;
    }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(`getSpace.uncached(${params.spaceId}, ${params.shareKey})`, async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getSpaceById(params.spaceId, {
                        shareKey: params.shareKey,
                    });
                    return res.data;
                });
            });
        },
        [input.apiToken ?? '', params.spaceId, params.shareKey ?? ''],
        {
            revalidate: 60 * 60 * 24,
            tags: [
                getCacheTag({
                    tag: 'space',
                    space: params.spaceId,
                }),
            ],
        }
    );

    return uncached();
});

const getChangeRequest = memoize(async function getChangeRequest(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        changeRequestId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.spaceId, params.changeRequestId ?? ''],
        {
            revalidate: 60 * 5,
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
});

const getRevision = memoize(async function getRevision(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(
                `getRevision.uncached(${params.spaceId}, ${params.revisionId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
                        const api = apiClient(input);
                        const res = await api.spaces.getRevisionById(
                            params.spaceId,
                            params.revisionId,
                            {
                                metadata: params.metadata,
                            }
                        );
                        return res.data;
                    });
                }
            );
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getRevisionPages = memoize(async function getRevisionPages(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
                            }
                        );
                        return res.data.pages;
                    });
                }
            );
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId],
        {
            revalidate: 60 * 60 * 24,
            tags: [],
        }
    );

    return uncached();
});

const getRevisionFile = memoize(async function getRevisionFile(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        fileId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId, params.fileId],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getRevisionPageMarkdown = memoize(async function getRevisionPageMarkdown(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        pageId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId, params.pageId],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getRevisionPageByPath = memoize(async function getRevisionPageByPath(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        path: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(
                `getRevisionPageByPath.uncached(${params.spaceId}, ${params.revisionId}, ${params.path})`,
                async () => {
                    return wrapDataFetcherError(async () => {
                        const api = apiClient(input);
                        const res = await api.spaces.getPageInRevisionByPath(
                            params.spaceId,
                            params.revisionId,
                            params.path,
                            {}
                        );
                        return res.data;
                    });
                }
            );
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId, params.path],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getDocument = memoize(async function getDocument(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        documentId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(
                `getDocument.uncached(${params.spaceId}, ${params.documentId})`,
                async () => {
                    return wrapDataFetcherError(async () => {
                        const api = apiClient(input);
                        const res = await api.spaces.getDocumentById(
                            params.spaceId,
                            params.documentId,
                            {}
                        );
                        return res.data;
                    });
                }
            );
        },
        [input.apiToken ?? '', params.spaceId, params.documentId],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getComputedDocument = memoize(async function getComputedDocument(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        organizationId: string;
        source: ComputedContentSource;
        seed: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [
            input.apiToken ?? '',
            params.spaceId,
            params.organizationId,
            getCacheKey([params.source]),
            params.seed,
        ],
        {
            revalidate: 60 * 60 * 24,
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
});

const getReusableContent = memoize(async function getReusableContent(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        reusableContentId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.spaceId, params.revisionId, params.reusableContentId],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const getLatestOpenAPISpecVersionContent = memoize(
    async function getLatestOpenAPISpecVersionContent(
        input: DataFetcherInput,
        params: {
            organizationId: string;
            slug: string;
        }
    ) {
        const uncached = unstable_cache(
            async () => {
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
            },
            [input.apiToken ?? '', params.organizationId, params.slug],
            {
                revalidate: 60 * 60 * 24,
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

const getPublishedContentSite = memoize(async function getPublishedContentSite(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.organizationId, params.siteId, params.siteShareKey ?? ''],
        {
            revalidate: 60 * 60 * 24,
            tags: [
                getCacheTag({
                    tag: 'site',
                    site: params.siteId,
                }),
            ],
        }
    );

    return uncached();
});

const getSiteRedirectBySource = memoize(async function getSiteRedirectBySource(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
        source: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [
            input.apiToken ?? '',
            params.organizationId,
            params.siteId,
            params.siteShareKey ?? '',
            params.source,
        ],
        {
            revalidate: 60 * 60 * 24,
            tags: [
                getCacheTag({
                    tag: 'site',
                    site: params.siteId,
                }),
            ],
        }
    );

    return uncached();
});

const getEmbedByUrl = memoize(async function getEmbedByUrl(
    input: DataFetcherInput,
    params: {
        url: string;
        spaceId: string;
    }
) {
    const uncached = unstable_cache(
        async () => {
            return trace(`getEmbedByUrl.uncached(${params.spaceId}, ${params.url})`, async () => {
                return wrapDataFetcherError(async () => {
                    const api = apiClient(input);
                    const res = await api.spaces.getEmbedByUrlInSpace(params.spaceId, {
                        url: params.url,
                    });
                    return res.data;
                });
            });
        },
        [input.apiToken ?? '', params.spaceId, params.url],
        {
            revalidate: 60 * 60 * 24 * 7,
            tags: [],
        }
    );

    return uncached();
});

const searchSiteContent = memoize(async function searchSiteContent(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [
            input.apiToken ?? '',
            params.organizationId,
            params.siteId,
            params.query,
            getCacheKey([params.scope]),
        ],
        {
            revalidate: 60 * 60 * 24,
            tags: [],
        }
    );

    return uncached();
});

const renderIntegrationUi = memoize(async function renderIntegrationUi(
    input: DataFetcherInput,
    params: {
        integrationName: string;
        request: RenderIntegrationUI;
    }
) {
    const uncached = unstable_cache(
        async () => {
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
        },
        [input.apiToken ?? '', params.integrationName],
        {
            revalidate: 60 * 60 * 24,
            tags: [
                getCacheTag({
                    tag: 'integration',
                    integration: params.integrationName,
                }),
            ],
        }
    );

    return uncached();
});

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
