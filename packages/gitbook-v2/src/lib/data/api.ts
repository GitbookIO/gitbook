import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'
import { GitBookAPI } from "@gitbook/api";
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from "@v2/lib/env";
import { GitBookDataFetcher } from "./types";
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
        getPublishedContentSite(organizationId, siteId) {
            return getPublishedContentSite(input, organizationId, siteId);
        },

        //
        // API that are not tied to the token
        // where the data is the same for all users
        //
        getUser(userId) {
            return getUser(commonInput, userId);
        },
        getPublishedContentByUrl(params) {
            return getPublishedContentByUrl(commonInput, params);
        },
    };
}

async function getUser(input: DataFetcherInput, userId: string) {
    'use cache'; 
    const res = await getAPI(input).users.getUserById(userId);
    return res.data;
}

async function getPublishedContentByUrl(input: DataFetcherInput, params: {
    url: string;
    visitorAuthToken?: string;
    redirectOnError?: boolean;
}) {
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

async function getPublishedContentSite(input: DataFetcherInput, organizationId: string, siteId: string) {
    'use cache';
    cacheTag(getSiteCacheTag(siteId));
    const res = await getAPI(input).orgs.getPublishedContentSite(organizationId, siteId);
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
