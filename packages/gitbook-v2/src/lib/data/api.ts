import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type GitBookAPIServiceBinding,
    type RenderIntegrationUI,
} from '@gitbook/api';
import { getCacheTag, getComputedContentSourceCacheTags } from '@gitbook/cache-tags';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { DataFetcherError, wrapDataFetcherError } from './errors';
import { memoize } from './memoize';
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
    };
}

const getUserById = memoize(async function getUserById(
    input: DataFetcherInput,
    params: { userId: string }
) {
    'use cache';

    return trace('getUserById.uncached', () => {
        cacheLife('days');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.users.getUserById(params.userId);
            return res.data;
        });
    });
});

const getSpace = memoize(async function getSpace(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        shareKey: string | undefined;
    }
) {
    'use cache';

    return trace('getSpace.uncached', () => {
        cacheLife('days');
        cacheTag(
            getCacheTag({
                tag: 'space',
                space: params.spaceId,
            })
        );

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getSpaceById(params.spaceId, {
                shareKey: params.shareKey,
            });
            return res.data;
        });
    });
});

const getChangeRequest = memoize(async function getChangeRequest(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        changeRequestId: string;
    }
) {
    'use cache';

    return trace('getChangeRequest.uncached', () => {
        cacheLife('minutes');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getChangeRequestById(
                params.spaceId,
                params.changeRequestId
            );
            cacheTag(
                getCacheTag({
                    tag: 'change-request',
                    space: params.spaceId,
                    changeRequest: res.data.id,
                })
            );
            return res.data;
        });
    });
});

const getRevision = memoize(async function getRevision(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    'use cache';

    return trace('getRevision.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getRevisionById(params.spaceId, params.revisionId, {
                metadata: params.metadata,
            });
            return res.data;
        });
    });
});

const getRevisionPages = memoize(async function getRevisionPages(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    'use cache';

    return trace('getRevisionPages.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.listPagesInRevisionById(
                params.spaceId,
                params.revisionId,
                {
                    metadata: params.metadata,
                }
            );
            return res.data.pages;
        });
    });
});

const getRevisionFile = memoize(async function getRevisionFile(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        fileId: string;
    }
) {
    'use cache';

    return trace('getRevisionFile.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getFileInRevisionById(
                params.spaceId,
                params.revisionId,
                params.fileId,
                {}
            );
            return res.data;
        });
    });
});

const getRevisionPageMarkdown = memoize(async function getRevisionPageMarkdown(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        pageId: string;
    }
) {
    'use cache';

    return trace('getRevisionPageMarkdown.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
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
    });
});

const getRevisionPageByPath = memoize(async function getRevisionPageByPath(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        path: string;
    }
) {
    'use cache';

    return trace('getRevisionPageByPath.uncached', () => {
        cacheLife('max');

        const encodedPath = encodeURIComponent(params.path);
        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getPageInRevisionByPath(
                params.spaceId,
                params.revisionId,
                encodedPath,
                {}
            );

            return res.data;
        });
    });
});

const getDocument = memoize(async function getDocument(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        documentId: string;
    }
) {
    'use cache';

    return trace('getDocument.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getDocumentById(params.spaceId, params.documentId, {});
            return res.data;
        });
    });
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
    'use cache';

    return trace('getComputedDocument.uncached', () => {
        cacheLife('days');

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
            const api = await apiClient(input);
            const res = await api.spaces.getComputedDocument(params.spaceId, {
                source: params.source,
                seed: params.seed,
            });
            return res.data;
        });
    });
});

const getReusableContent = memoize(async function getReusableContent(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        reusableContentId: string;
    }
) {
    'use cache';

    return trace('getReusableContent.uncached', () => {
        cacheLife('max');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getReusableContentInRevisionById(
                params.spaceId,
                params.revisionId,
                params.reusableContentId
            );
            return res.data;
        });
    });
});

const getLatestOpenAPISpecVersionContent = memoize(
    async function getLatestOpenAPISpecVersionContent(
        input: DataFetcherInput,
        params: {
            organizationId: string;
            slug: string;
        }
    ) {
        'use cache';

        return trace('getLatestOpenAPISpecVersionContent.uncached', () => {
            cacheTag(
                getCacheTag({
                    tag: 'openapi',
                    organization: params.organizationId,
                    openAPISpec: params.slug,
                })
            );
            cacheLife('days');

            return wrapDataFetcherError(async () => {
                const api = await apiClient(input);
                const res = await api.orgs.getLatestOpenApiSpecVersionContent(
                    params.organizationId,
                    params.slug
                );
                return res.data;
            });
        });
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
    'use cache';

    return trace('getPublishedContentSite.uncached', () => {
        cacheLife('days');
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );

        return trace('getPublishedContentSite', () => {
            return wrapDataFetcherError(async () => {
                const api = await apiClient(input);
                const res = await api.orgs.getPublishedContentSite(
                    params.organizationId,
                    params.siteId,
                    {
                        shareKey: params.siteShareKey,
                    }
                );
                return res.data;
            });
        });
    });
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
    'use cache';

    return trace('getSiteRedirectBySource.uncached', () => {
        cacheTag(
            getCacheTag({
                tag: 'site',
                site: params.siteId,
            })
        );
        cacheLife('days');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
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
    });
});

const getEmbedByUrl = memoize(async function getEmbedByUrl(
    input: DataFetcherInput,
    params: {
        url: string;
        spaceId: string;
    }
) {
    'use cache';

    return trace('getEmbedByUrl.uncached', () => {
        cacheLife('weeks');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.spaces.getEmbedByUrlInSpace(params.spaceId, { url: params.url });
            return res.data;
        });
    });
});

const searchSiteContent = memoize(async function searchSiteContent(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
) {
    'use cache';

    return trace('searchSiteContent.uncached', () => {
        const { organizationId, siteId, query, scope } = params;

        cacheLife('days');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.orgs.searchSiteContent(organizationId, siteId, {
                query,
                ...scope,
            });
            return res.data.items;
        });
    });
});

const renderIntegrationUi = memoize(async function renderIntegrationUi(
    input: DataFetcherInput,
    params: {
        integrationName: string;
        request: RenderIntegrationUI;
    }
) {
    'use cache';

    return trace('renderIntegrationUi.uncached', () => {
        cacheTag(getCacheTag({ tag: 'integration', integration: params.integrationName }));
        cacheLife('days');

        return wrapDataFetcherError(async () => {
            const api = await apiClient(input);
            const res = await api.integrations.renderIntegrationUiWithPost(
                params.integrationName,
                params.request
            );
            return res.data;
        });
    });
});

let loggedServiceBinding = false;

/**
 * Create a new API client.
 */
export async function apiClient(input: DataFetcherInput = { apiToken: null }) {
    const { apiToken } = input;
    let serviceBinding: GitBookAPIServiceBinding | undefined;

    try {
        // HACK: This is a workaround to avoid webpack trying to bundle this cloudflare only module
        // @ts-ignore
        const { env } = await import(
            /* webpackIgnore: true */ `${'__cloudflare:workers'.replaceAll('_', '')}`
        );
        serviceBinding = env.GITBOOK_API;
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
    } catch (error) {
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            throw error;
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
