import type { GitBookAPI, PublishedSiteContentLookup, SiteVisitorPayload } from '@gitbook/api';

import { apiClient } from './api';
import { getExposableError } from './errors';
import type { DataFetcherResponse } from './types';
import { getURLLookup, stripURLSearch } from './urls';
import { tryCatch } from '@/lib/async';
import { isPreviewRequest } from '@/lib/preview';
import { trace } from '@/lib/tracing';

type ResolveBody = Parameters<GitBookAPI['urls']['resolvePublishedContentByUrl']>[0];

interface LookupPublishedContentByUrlInput {
    url: string;
    redirectOnError: boolean;
    apiToken: string | null;
    visitorPayload: SiteVisitorPayload;
}

/**
 * Lookup a content by its URL using the GitBook resolvePublishedContentByUrl API endpoint.
 */
export async function lookupPublishedContentByUrl(
    input: LookupPublishedContentByUrlInput
): Promise<DataFetcherResponse<PublishedSiteContentLookup>> {
    const lookupURL = new URL(input.url);
    const lookup = getURLLookup(stripURLSearch(lookupURL));

    if (!lookup) {
        return {
            error: {
                code: 404,
                message: 'No content found',
            },
        };
    }

    const api = apiClient({ apiToken: input.apiToken });
    const callResult = await trace(
        {
            operation: 'resolvePublishedContentByUrl',
            name: lookup,
        },
        () =>
            tryCatch(
                api.urls.resolvePublishedContentByUrl({
                    url: lookup,
                    ...(input.visitorPayload ? { visitor: input.visitorPayload } : {}),
                    redirectOnError: input.redirectOnError,
                } as ResolveBody) //TODO: remove cast when we are sure that everything is good
            )
    );

    if (callResult.error) {
        return {
            error: getExposableError(callResult.error),
        };
    }

    const {
        data: { data },
    } = callResult;

    if ('redirect' in data && data.target === 'application' && isPreviewRequest(lookupURL)) {
        // The cached lookup omits the query params needed after login.
        const redirect = new URL(data.redirect);
        redirect.searchParams.set('redirect', lookupURL.toString());
        return { data: { ...data, redirect: redirect.toString() } };
    }

    return { data };
}
