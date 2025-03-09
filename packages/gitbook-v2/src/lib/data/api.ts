import { type ComputedContentSource, GitBookAPI } from '@gitbook/api';
import {
    getCacheTag,
    getCacheTagForURL,
    getComputedContentSourceCacheTags,
} from '@gitbook/cache-tags';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
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
}

const commonInput: DataFetcherInput = {
    apiEndpoint: GITBOOK_API_URL,
    apiToken: GITBOOK_API_TOKEN,
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

        withToken({ apiToken }) {
            return createDataFetcher({
                ...input,
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
                metadata: params.metadata,
            });
        },
        getRevisionPages(params) {
            return getRevisionPages(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                metadata: params.metadata,
            });
        },
        getRevisionFile(params) {
            return getRevisionFile(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                fileId: params.fileId,
            });
        },
        getRevisionPageByPath(params) {
            return getRevisionPageByPath(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                path: params.path,
            });
        },
        getReusableContent(params) {
            return getReusableContent(input, {
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

        //
        // API that are not tied to the token
        // where the data is the same for all users
        //
        getUserById(userId) {
            return getUserById(commonInput, userId);
        },
        getPublishedContentByUrl(params) {
            return getPublishedContentByUrl(commonInput, {
                url: params.url,
                visitorAuthToken: params.visitorAuthToken,
                redirectOnError: params.redirectOnError,
            });
        },
    };
}

async function getUserById(input: DataFetcherInput, userId: string) {
    'use cache';

    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).users.getUserById(userId);
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
        const res = await getAPI(input).spaces.getSpaceById(params.spaceId, {
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

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getRevisionById(params.spaceId, params.revisionId, {
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
        const res = await getAPI(input).spaces.listPagesInRevisionById(
            params.spaceId,
            params.revisionId,
            {
                metadata: params.metadata,
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

    cacheLife('max');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).spaces.getFileInRevisionById(
            params.spaceId,
            params.revisionId,
            params.fileId
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
        const res = await getAPI(input).spaces.getPageInRevisionByPath(
            params.spaceId,
            params.revisionId,
            encodedPath
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
        const res = await getAPI(input).spaces.getDocumentById(params.spaceId, params.documentId);
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

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: params.siteId,
        })
    );
    cacheLife('days');

    return wrapDataFetcherError(async () => {
        const res = await getAPI(input).orgs.getPublishedContentSite(
            params.organizationId,
            params.siteId,
            {
                shareKey: params.siteShareKey,
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
    const api = new GitBookAPI({
        authToken: apiToken ?? undefined,
        endpoint: apiEndpoint,
        userAgent: GITBOOK_USER_AGENT,
    });

    return api;
}
