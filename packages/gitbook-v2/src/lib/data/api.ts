import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { GitBookAPI } from '@gitbook/api';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { GitBookDataFetcher } from './types';
import { getHostnameCacheTag, getSiteCacheTag } from '../cache';

interface DataFetcherInput {
    /**
     * API host to use.
     */
    apiEndpoint: string;

    /**
     * API token.
     */
    apiToken: string;
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
        getRevisionFile(params) {
            return getRevisionFile(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                fileId: params.fileId,
            });
        },
        getReusableContent(params) {
            return getReusableContent(input, {
                spaceId: params.spaceId,
                revisionId: params.revisionId,
                reusableContentId: params.reusableContentId,
            });
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

    try {
        const res = await getAPI(input).users.getUserById(userId);
        return res.data;
    } catch (error) {
        if (checkHasErrorCode(error, 404)) {
            return null;
        }

        throw error;
    }
}

async function getRevisionFile(
    input: DataFetcherInput,
    params: {
        spaceId: string;
        revisionId: string;
        fileId: string;
    },
) {
    'use cache';

    try {
        const res = await getAPI(input).spaces.getFileInRevisionById(
            params.spaceId,
            params.revisionId,
            params.fileId,
        );
        return res.data;
    } catch (error) {
        if (checkHasErrorCode(error, 404)) {
            return null;
        }

        throw error;
    }
}

async function getReusableContent(input: DataFetcherInput, params: {
    spaceId: string;
    revisionId: string;
    reusableContentId: string;
}) {
    'use cache';

    try {
        const res = await getAPI(input).spaces.getReusableContentInRevisionById(params.spaceId, params.revisionId, params.reusableContentId);
        return res.data;
    } catch (error) {
        if (checkHasErrorCode(error, 404)) {
            return null;
        }

        throw error;
    }
}


async function getPublishedContentByUrl(
    input: DataFetcherInput,
    params: {
        url: string;
        visitorAuthToken?: string;
        redirectOnError?: boolean;
    },
) {
    'use cache';

    const { url, visitorAuthToken, redirectOnError } = params;

    const hostname = new URL(url).hostname;
    cacheTag(getHostnameCacheTag(hostname));

    const res = await getAPI(input).urls.getPublishedContentByUrl({
        url,
        visitorAuthToken,
        redirectOnError,
    });

    if ('site' in res.data) {
        cacheTag(getSiteCacheTag(res.data.site));
    }

    return res.data;
}

async function getPublishedContentSite(
    input: DataFetcherInput,
    params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
    },
) {
    'use cache';
    cacheTag(getSiteCacheTag(params.siteId));
    const res = await getAPI(input).orgs.getPublishedContentSite(
        params.organizationId,
        params.siteId,
        {
            shareKey: params.siteShareKey,
        },
    );
    return res.data;
}

function getAPI(input: DataFetcherInput) {
    const { apiEndpoint, apiToken } = input;
    const api = new GitBookAPI({
        authToken: apiToken,
        endpoint: apiEndpoint,
        userAgent: GITBOOK_USER_AGENT,
    });

    return api;
}

function checkHasErrorCode(error: unknown, code: number) {
    return error instanceof Error && 'code' in error && error.code === code;
}
