import { trace } from '@/lib/tracing';
import { type ComputedContentSource, GitBookAPI } from '@gitbook/api';
import {
    getCacheTag,
    getCacheTagForURL,
    getComputedContentSourceCacheTags,
} from '@gitbook/cache-tags';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { getCloudflareRequestCache } from './cloudflare';
import { wrapDataFetcherError } from './errors';
import type { GitBookDataFetcher } from './types';

interface DataFetcherInput {
    /**
     * API host to use.
     */
    apiEndpoint: string;

    /**
     * API token.
     */
    apiToken: string | null;

    /**
     * Context ID to use for the cache.
     */
    contextId: string | undefined;
}

const commonInput: DataFetcherInput = {
    apiEndpoint: GITBOOK_API_URL,
    apiToken: GITBOOK_API_TOKEN,
    contextId: undefined,
};

/**
 * Create a data fetcher using an API token.
 * The data are being cached by Next.js built-in cache.
 */
export function createDataFetcher(input: DataFetcherInput = commonInput): GitBookDataFetcher {
    return {
        apiEndpoint: input.apiEndpoint,

        async api() {
            return getAPI(input);
        },

        withToken({ apiToken, contextId }) {
            return createDataFetcher({
                ...input,
                apiToken,
                contextId,
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
            return trace('getUserById', () => getUserById(commonInput, { userId }));
        },
        getPublishedContentByUrl(params) {
            return trace('getPublishedContentByUrl', () =>
                getPublishedContentByUrl(commonInput, {
                    url: params.url,
                    visitorAuthToken: params.visitorAuthToken,
                    redirectOnError: params.redirectOnError,
                })
            );
        },
    };
}

async function getUserById(input: DataFetcherInput, params: { userId: string }) {
    'use cache';

    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).users.getUserById(params.userId, {
            cf: getCloudflareRequestCache({
                operationId: 'getUserById',
                contextId: input.contextId,
                cacheInput: params,
                cacheTags: [],
                cacheProfile: 'days',
            }),
        });
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

    const cacheProfile = 'days';
    const cacheTags = [
        getCacheTag({
            tag: 'space',
            space: params.spaceId,
        }),
    ];

    cacheLife(cacheProfile);
    cacheTag(...cacheTags);

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getSpaceById(
            params.spaceId,
            {
                shareKey: params.shareKey,
            },
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getSpaceById',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags,
                    cacheProfile,
                }),
            }
        );
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
        const res = await getAPI(input).spaces.getChangeRequestById(
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

    const cacheProfile = 'max';
    cacheLife(cacheProfile);

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getRevisionById(
            params.spaceId,
            params.revisionId,
            {
                metadata: params.metadata,
            },
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getRevisionById',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags: [],
                    cacheProfile,
                }),
            }
        );
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

    const cacheProfile = 'max';
    cacheLife(cacheProfile);

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.listPagesInRevisionById(
            params.spaceId,
            params.revisionId,
            {
                metadata: params.metadata,
            },
            {
                cf: getCloudflareRequestCache({
                    operationId: 'listPagesInRevisionById',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags: [],
                    cacheProfile,
                }),
            }
        );
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

    const cacheProfile = 'max';
    cacheLife(cacheProfile);

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getFileInRevisionById(
            params.spaceId,
            params.revisionId,
            params.fileId,
            {},
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getFileInRevisionById',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags: [],
                    cacheProfile,
                }),
            }
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

    const cacheProfile = 'max';
    cacheLife(cacheProfile);

    const encodedPath = encodeURIComponent(params.path);
    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getPageInRevisionByPath(
            params.spaceId,
            params.revisionId,
            encodedPath,
            {},
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getPageInRevisionByPath',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags: [],
                    cacheProfile,
                }),
            }
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

    const cacheProfile = 'max';
    cacheLife(cacheProfile);

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getDocumentById(
            params.spaceId,
            params.documentId,
            {},
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getDocumentById',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags: [],
                    cacheProfile,
                }),
            }
        );
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
        const res = await getAPI(input).spaces.getComputedDocument(params.spaceId, {
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
        const res = await getAPI(input).spaces.getReusableContentInRevisionById(
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
        const res = await getAPI(input).orgs.getLatestOpenApiSpecVersionContent(
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
        const res = await getAPI(input).urls.getPublishedContentByUrl({
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

    const cacheProfile = 'days';
    const cacheTags = [
        getCacheTag({
            tag: 'site',
            site: params.siteId,
        }),
    ];

    cacheLife(cacheProfile);
    cacheTag(...cacheTags);
    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).orgs.getPublishedContentSite(
            params.organizationId,
            params.siteId,
            {
                shareKey: params.siteShareKey,
            },
            {
                cf: getCloudflareRequestCache({
                    operationId: 'getPublishedContentSite',
                    contextId: input.contextId,
                    cacheInput: params,
                    cacheTags,
                    cacheProfile,
                }),
            }
        );
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
        const res = await getAPI(input).orgs.getSiteRedirectBySource(
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
        const api = getAPI(input);
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
        const res = await getAPI(input).orgs.searchSiteContent(organizationId, siteId, {
            query,
            ...scope,
        });
        return res.data.items;
    });
}

function getAPI(input: DataFetcherInput) {
    const { apiEndpoint, apiToken } = input;
    const serviceBinding = getCloudflareContext().env.GITBOOK_API;

    const api = new GitBookAPI({
        authToken: apiToken ?? undefined,
        endpoint: apiEndpoint,
        userAgent: GITBOOK_USER_AGENT,
        serviceBinding,
    });

    return api;
}
