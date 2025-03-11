import { trace } from '@/lib/tracing';
import {
    type ComputedContentSource,
    GitBookAPI,
    type GitBookAPIServiceBinding,
} from '@gitbook/api';
import {
    getCacheTag,
    getCacheTagForURL,
    getComputedContentSourceCacheTags,
} from '@gitbook/cache-tags';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { wrapDataFetcherError } from './errors';
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
            return apiClient(input, 'createDataFetcher');
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

        //
        // API that are not tied to the token
        // where the data is the same for all users
        //
        getUserById(userId) {
            return trace('getUserById', () => getUserById({ apiToken: null }, { userId }));
        },
        getPublishedContentByUrl(params) {
            return trace('getPublishedContentByUrl', () =>
                getPublishedContentByUrl(
                    { apiToken: null },
                    {
                        url: params.url,
                        visitorAuthToken: params.visitorAuthToken,
                        redirectOnError: params.redirectOnError,
                    }
                )
            );
        },
    };
}

async function getUserById(input: DataFetcherInput, params: { userId: string }) {
    'use cache';

    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getUserById');
        const res = await api.users.getUserById(params.userId);
        return res.data;
    });
}

async function getSpace(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        shareKey: string | undefined;
    }
) {
    'use cache';

    cacheLife('days');
    cacheTag(
        getCacheTag({
            tag: 'space',
            space: params.spaceId,
        })
    );

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getSpace');
        const res = await api.spaces.getSpaceById(params.spaceId, {
            shareKey: params.shareKey,
        });
        return res.data;
    });
}

async function getChangeRequest(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        changeRequestId: string;
    }
) {
    'use cache';

    cacheLife('minutes');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getChangeRequest');
        const res = await api.spaces.getChangeRequestById(params.spaceId, params.changeRequestId);
        cacheTag(
            getCacheTag({
                tag: 'change-request',
                space: params.spaceId,
                changeRequest: res.data.id,
            })
        );
        return res.data;
    });
}

async function getRevision(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    'use cache';

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getRevision');
        const res = await api.spaces.getRevisionById(params.spaceId, params.revisionId, {
            metadata: params.metadata,
        });
        return res.data;
    });
}

async function getRevisionPages(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }
) {
    'use cache';

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getRevisionPages');
        const res = await api.spaces.listPagesInRevisionById(params.spaceId, params.revisionId, {
            metadata: params.metadata,
        });
        return res.data.pages;
    });
}

async function getRevisionFile(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        fileId: string;
    }
) {
    'use cache';

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getRevisionFile');
        const res = await api.spaces.getFileInRevisionById(
            params.spaceId,
            params.revisionId,
            params.fileId,
            {}
        );
        return res.data;
    });
}

async function getRevisionPageByPath(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        path: string;
    }
) {
    'use cache';

    cacheLife('max');

    const encodedPath = encodeURIComponent(params.path);
    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getRevisionPageByPath');
        const res = await api.spaces.getPageInRevisionByPath(
            params.spaceId,
            params.revisionId,
            encodedPath,
            {}
        );

        return res.data;
    });
}

async function getDocument(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        documentId: string;
    }
) {
    'use cache';

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getDocument');
        const res = await api.spaces.getDocumentById(params.spaceId, params.documentId, {});
        return res.data;
    });
}

async function getComputedDocument(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        organizationId: string;
        source: ComputedContentSource;
    }
) {
    'use cache';

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
        const api = await apiClient(input, 'getComputedDocument');
        const res = await api.spaces.getComputedDocument(params.spaceId, {
            source: params.source,
        });
        return res.data;
    });
}

async function getReusableContent(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        reusableContentId: string;
    }
) {
    'use cache';

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getReusableContent');
        const res = await api.spaces.getReusableContentInRevisionById(
            params.spaceId,
            params.revisionId,
            params.reusableContentId
        );
        return res.data;
    });
}

async function getLatestOpenAPISpecVersionContent(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        slug: string;
    }
) {
    'use cache';

    cacheTag(
        getCacheTag({
            tag: 'openapi',
            organization: params.organizationId,
            openAPISpec: params.slug,
        })
    );
    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getLatestOpenAPISpecVersionContent');
        const res = await api.orgs.getLatestOpenApiSpecVersionContent(
            params.organizationId,
            params.slug
        );
        return res.data;
    });
}

async function getPublishedContentByUrl(
    input: DataFetcherInput,
    params: {
        url: string;
        visitorAuthToken: string | null;
        redirectOnError: boolean;
    }
) {
    'use cache';

    const { url, visitorAuthToken, redirectOnError } = params;

    cacheTag(getCacheTagForURL(url));
    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getPublishedContentByUrl');
        const res = await api.urls.getPublishedContentByUrl({
            url,
            visitorAuthToken: visitorAuthToken ?? undefined,
            redirectOnError,
        });

        if ('site' in res.data) {
            cacheTag(
                getCacheTag({
                    tag: 'site',
                    site: res.data.site,
                })
            );
        }

        return res.data;
    });
}

async function getPublishedContentSite(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
    }
) {
    'use cache';

    cacheLife('days');
    cacheTag(
        getCacheTag({
            tag: 'site',
            site: params.siteId,
        })
    );

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getPublishedContentSite');
        const res = await api.orgs.getPublishedContentSite(params.organizationId, params.siteId, {
            shareKey: params.siteShareKey,
        });
        return res.data;
    });
}

async function getSiteRedirectBySource(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
        source: string;
    }
) {
    'use cache';

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: params.siteId,
        })
    );
    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getSiteRedirectBySource');
        const res = await api.orgs.getSiteRedirectBySource(params.organizationId, params.siteId, {
            shareKey: params.siteShareKey,
            source: params.source,
        });

        return res.data;
    });
}

async function getEmbedByUrl(
    input: DataFetcherInput,
    params: {
        url: string;
        spaceId: string;
    }
) {
    'use cache';

    cacheLife('weeks');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'getEmbedByUrl');
        const res = await api.spaces.getEmbedByUrlInSpace(params.spaceId, { url: params.url });
        return res.data;
    });
}

async function searchSiteContent(
    input: DataFetcherInput,
    params: Parameters<GitBookDataFetcher['searchSiteContent']>[0]
) {
    'use cache';

    const { organizationId, siteId, query, scope } = params;

    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const api = await apiClient(input, 'searchSiteContent');
        const res = await api.orgs.searchSiteContent(organizationId, siteId, {
            query,
            ...scope,
        });
        return res.data.items;
    });
}

/**
 * Create a new API client.
 *
 * @param input - The input data fetcher.
 * @returns A new API client.
 */
export async function apiClient(input: DataFetcherInput, purpose: string) {
    const { apiToken } = input;
    let serviceBinding: GitBookAPIServiceBinding | undefined;

    try {
        const { env } = getCloudflareContext();
        serviceBinding = env.GITBOOK_API;
    } catch (error) {
        // IGNORE
        if (process.env.NODE_ENV !== 'development') {
            console.warn('Failed to get service binding', purpose, error);
        }
    }

    try {
        // @ts-ignore
        const r = await import(
            /* webpackIgnore: true */ `${'__cloudflare:env'.replaceAll('_', '')}`
        );
        console.log('r', r);
    } catch (error) {
        console.log('error', error);
    }

    console.log(
        // @ts-ignore
        `api: ${GITBOOK_API_URL} ${purpose} (serviceBinding=${!!serviceBinding}) (ctx=${!!globalThis[Symbol.for('__cloudflare-context__')]})`
    );
    console.log(
        `__cloudflare-context__${purpose}`,
        // @ts-ignore
        globalThis[Symbol.for('__cloudflare-context__')],
        // @ts-ignore
        globalThis?.global?.[Symbol.for('__cloudflare-context__')]
    );
    // @ts-ignore
    console.log(`Object.keys(globalThis)${purpose}`, Object.keys(globalThis));
    const api = new GitBookAPI({
        authToken: apiToken || GITBOOK_API_TOKEN || undefined,
        endpoint: GITBOOK_API_URL,
        userAgent: GITBOOK_USER_AGENT,
        serviceBinding,
    });

    return api;
}
