import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type GitBookAPIServiceBinding,
    type HttpResponse,
    type RenderIntegrationUI,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';
import {
    GITBOOK_API_TOKEN,
    GITBOOK_API_URL,
    GITBOOK_RUNTIME,
    GITBOOK_USER_AGENT,
} from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
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
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (cacheKey, input: DataFetcherInput, params: { userId: string }) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getUserByIdUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getUserByIdUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.days,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getUserByIdUseCache = async (input: DataFetcherInput, params: { userId: string }) => {
    'use cache';
    return getUserByIdUncached(input, params, true);
};

const getUserByIdUncached = async (
    input: DataFetcherInput,
    params: { userId: string },
    withUseCache = false
) => {
    return trace(`getUserById.uncached(${params.userId})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.users.getUserById(params.userId);
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
            }
            return res.data;
        });
    });
};

const getSpace = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; shareKey: string | undefined }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getSpaceUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getSpaceUncached(input, params);
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
    )
);

const getSpaceUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; shareKey: string | undefined }
) => {
    'use cache';
    return getSpaceUncached(input, params, true);
};

const getSpaceUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; shareKey: string | undefined },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'space',
                space: params.spaceId,
            })
        );
    }

    return trace(`getSpace.uncached(${params.spaceId}, ${params.shareKey})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.spaces.getSpaceById(params.spaceId, {
                shareKey: params.shareKey,
            });

            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
            }
            return res.data;
        });
    });
};

const getChangeRequest = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; changeRequestId: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getChangeRequestUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getChangeRequestUncached(input, params);
                },
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
    )
);

const getChangeRequestUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; changeRequestId: string }
) => {
    'use cache';
    return getChangeRequestUncached(input, params, true);
};

const getChangeRequestUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; changeRequestId: string },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'change-request',
                space: params.spaceId,
                changeRequest: params.changeRequestId,
            })
        );
    }

    return trace(
        `getChangeRequest.uncached(${params.spaceId}, ${params.changeRequestId})`,
        async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getChangeRequestById(
                    params.spaceId,
                    params.changeRequestId
                );
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('minutes');
                }
                return res.data;
            });
        }
    );
};

const getRevision = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; metadata: boolean }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getRevisionUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getRevisionUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getRevisionUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; metadata: boolean }
) => {
    'use cache';
    return getRevisionUncached(input, params, true);
};

const getRevisionUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; metadata: boolean },
    withUseCache = false
) => {
    return trace(`getRevision.uncached(${params.spaceId}, ${params.revisionId})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.spaces.getRevisionById(params.spaceId, params.revisionId, {
                metadata: params.metadata,
            });
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('max');
            }
            return res.data;
        });
    });
};

const getRevisionPages = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; metadata: boolean }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getRevisionPagesUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getRevisionPagesUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getRevisionPagesUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; metadata: boolean }
) => {
    'use cache';
    return getRevisionPagesUncached(input, params, true);
};

const getRevisionPagesUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; metadata: boolean },
    withUseCache = false
) => {
    return trace(`getRevisionPages.uncached(${params.spaceId}, ${params.revisionId})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.spaces.listPagesInRevisionById(
                params.spaceId,
                params.revisionId,
                {
                    metadata: params.metadata,
                }
            );
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('max');
            }
            return res.data.pages;
        });
    });
};

const getRevisionFile = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; fileId: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getRevisionFileUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getRevisionFileUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getRevisionFileUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; fileId: string }
) => {
    'use cache';
    return getRevisionFileUncached(input, params, true);
};

const getRevisionFileUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; fileId: string },
    withUseCache = false
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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }
                return res.data;
            });
        }
    );
};

const getRevisionPageMarkdown = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; pageId: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getRevisionPageMarkdownUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getRevisionPageMarkdownUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getRevisionPageMarkdownUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; pageId: string }
) => {
    'use cache';
    return getRevisionPageMarkdownUncached(input, params, true);
};

const getRevisionPageMarkdownUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; pageId: string },
    withUseCache = false
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

                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }

                if (!('markdown' in res.data)) {
                    throw new DataFetcherError('Page is not a document', 404);
                }
                return res.data.markdown;
            });
        }
    );
};

const getRevisionPageByPath = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; path: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getRevisionPageByPathUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getRevisionPageByPathUncached(input, params);
                },
                [cacheKey, 'v2'],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getRevisionPageByPathUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; path: string }
) => {
    'use cache';
    return getRevisionPageByPathUncached(input, params, true);
};

const getRevisionPageByPathUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; path: string },
    withUseCache = false
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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }
                return res.data;
            });
        }
    );
};

const getDocument = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; documentId: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getDocumentUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getDocumentUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getDocumentUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; documentId: string }
) => {
    'use cache';
    return getDocumentUncached(input, params, true);
};

const getDocumentUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; documentId: string },
    withUseCache = false
) => {
    return trace(`getDocument.uncached(${params.spaceId}, ${params.documentId})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.spaces.getDocumentById(params.spaceId, params.documentId, {});
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('max');
            }
            return res.data;
        });
    });
};

const getComputedDocument = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
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
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getComputedDocumentUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getComputedDocumentUncached(input, params);
                },
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
    )
);

const getComputedDocumentUseCache = async (
    input: DataFetcherInput,
    params: {
        spaceId: string;
        organizationId: string;
        source: ComputedContentSource;
        seed: string;
    }
) => {
    'use cache';
    return getComputedDocumentUncached(input, params, true);
};

const getComputedDocumentUncached = async (
    input: DataFetcherInput,
    params: {
        spaceId: string;
        organizationId: string;
        source: ComputedContentSource;
        seed: string;
    },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            ...getComputedContentSourceCacheTags(
                {
                    spaceId: params.spaceId,
                    organizationId: params.organizationId,
                },
                params.source
            )
        );
    }

    return trace(
        `getComputedDocument.uncached(${params.spaceId}, ${params.organizationId}, ${params.source.type}, ${params.seed})`,
        async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.spaces.getComputedDocument(params.spaceId, {
                    source: params.source,
                    seed: params.seed,
                });
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }
                return res.data;
            });
        }
    );
};

const getReusableContent = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { spaceId: string; revisionId: string; reusableContentId: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getReusableContentUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getReusableContentUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.max,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getReusableContentUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; reusableContentId: string }
) => {
    'use cache';
    return getReusableContentUncached(input, params, true);
};

const getReusableContentUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; revisionId: string; reusableContentId: string },
    withUseCache = false
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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }
                return res.data;
            });
        }
    );
};

const getLatestOpenAPISpecVersionContent = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { organizationId: string; slug: string }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getLatestOpenAPISpecVersionContentUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getLatestOpenAPISpecVersionContentUncached(input, params);
                },
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
    )
);

const getLatestOpenAPISpecVersionContentUseCache = async (
    input: DataFetcherInput,
    params: { organizationId: string; slug: string }
) => {
    'use cache';
    return getLatestOpenAPISpecVersionContentUncached(input, params, true);
};

const getLatestOpenAPISpecVersionContentUncached = async (
    input: DataFetcherInput,
    params: { organizationId: string; slug: string },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'openapi',
                organization: params.organizationId,
                openAPISpec: params.slug,
            })
        );
    }

    return trace(
        `getLatestOpenAPISpecVersionContent.uncached(${params.organizationId}, ${params.slug})`,
        async () => {
            return wrapDataFetcherError(async () => {
                const api = apiClient(input);
                const res = await api.orgs.getLatestOpenApiSpecVersionContent(
                    params.organizationId,
                    params.slug
                );
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('max');
                }
                return res.data;
            });
        }
    );
};

const getPublishedContentSite = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { organizationId: string; siteId: string; siteShareKey: string | undefined }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getPublishedContentSiteUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getPublishedContentSiteUncached(input, params);
                },
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
    )
);

const getPublishedContentSiteUseCache = async (
    input: DataFetcherInput,
    params: { organizationId: string; siteId: string; siteShareKey: string | undefined }
) => {
    'use cache';
    return getPublishedContentSiteUncached(input, params, true);
};

const getPublishedContentSiteUncached = async (
    input: DataFetcherInput,
    params: { organizationId: string; siteId: string; siteShareKey: string | undefined },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );
    }

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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('days');
                }
                return res.data;
            });
        }
    );
};

const getSiteRedirectBySource = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
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
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getSiteRedirectBySourceUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getSiteRedirectBySourceUncached(input, params);
                },
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
    )
);

const getSiteRedirectBySourceUseCache = async (
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
        source: string;
    }
) => {
    'use cache';
    return getSiteRedirectBySourceUncached(input, params, true);
};

const getSiteRedirectBySourceUncached = async (
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
        source: string;
    },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );
    }

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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('days');
                }
                return res.data;
            });
        }
    );
};

const getEmbedByUrl = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (cacheKey, input: DataFetcherInput, params: { spaceId: string; url: string }) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return getEmbedByUrlUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return getEmbedByUrlUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.weeks,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const getEmbedByUrlUseCache = async (
    input: DataFetcherInput,
    params: { spaceId: string; url: string }
) => {
    'use cache';
    return getEmbedByUrlUncached(input, params, true);
};

const getEmbedByUrlUncached = async (
    input: DataFetcherInput,
    params: { spaceId: string; url: string },
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'space',
                space: params.spaceId,
            })
        );
    }

    return trace(`getEmbedByUrl.uncached(${params.spaceId}, ${params.url})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.spaces.getEmbedByUrlInSpace(params.spaceId, {
                url: params.url,
            });
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('weeks');
            }
            return res.data;
        });
    });
};

const searchSiteContent = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return searchSiteContentUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return searchSiteContentUncached(input, params);
                },
                [cacheKey],
                {
                    revalidate: RevalidationProfile.hours,
                    tags: [],
                }
            );

            return uncached();
        }
    )
);

const searchSiteContentUseCache = async (
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
) => {
    'use cache';
    return searchSiteContentUncached(input, params, true);
};

const searchSiteContentUncached = async (
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0],
    withUseCache = false
) => {
    if (withUseCache) {
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );
    }

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
                if (withUseCache) {
                    cacheTag(...getCacheTagsFromResponse(res));
                    cacheLife('hours');
                }
                return res.data.items;
            });
        }
    );
};

const renderIntegrationUi = withCacheKey(
    withoutConcurrentExecution(
        getCloudflareRequestGlobal,
        async (
            cacheKey,
            input: DataFetcherInput,
            params: { integrationName: string; request: RenderIntegrationUI }
        ) => {
            if (GITBOOK_RUNTIME !== 'cloudflare') {
                return renderIntegrationUiUseCache(input, params);
            }

            // FIXME: OpenNext doesn't support 'use cache' yet
            const uncached = unstable_cache(
                async () => {
                    return renderIntegrationUiUncached(input, params);
                },
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
    )
);

const renderIntegrationUiUseCache = async (
    input: DataFetcherInput,
    params: { integrationName: string; request: RenderIntegrationUI }
) => {
    'use cache';
    return renderIntegrationUiUncached(input, params, true);
};

const renderIntegrationUiUncached = (
    input: DataFetcherInput,
    params: { integrationName: string; request: RenderIntegrationUI },
    withUseCache = false
) => {
    return trace(`renderIntegrationUi.uncached(${params.integrationName})`, async () => {
        return wrapDataFetcherError(async () => {
            const api = apiClient(input);
            const res = await api.integrations.renderIntegrationUiWithPost(
                params.integrationName,
                params.request
            );
            if (withUseCache) {
                cacheTag(...getCacheTagsFromResponse(res));
                cacheLife('days');
            }
            return res.data;
        });
    });
};

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

/**
 * Get the tags from the API responses.
 */
function getCacheTagsFromResponse(response: HttpResponse<unknown, unknown>) {
    const cacheTagHeader = response.headers.get('x-gitbook-cache-tag');
    const tags = !cacheTagHeader ? [] : cacheTagHeader.split(',');
    return tags;
}
