import type { GitBookAPI, PublishedSiteContentLookup, SiteVisitorPayload } from '@gitbook/api';

import { apiClient } from './api';
import { getExposableError } from './errors';
import type { DataFetcherResponse } from './types';
import { getURLLookup, getURLLookupPathname, stripURLSearch } from './urls';
import { tryCatch } from '@/lib/async';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';
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
            name: lookup.url,
        },
        () =>
            tryCatch(
                api.urls.resolvePublishedContentByUrl({
                    url: lookup.url,
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

    if ('redirect' in data) {
        if (data.target === 'application' && isPreviewRequest(lookupURL)) {
            // The cached lookup omits content selectors and query params needed after login.
            const redirect = new URL(data.redirect);
            redirect.searchParams.set('redirect', lookupURL.toString());
            return { data: { ...data, redirect: redirect.toString() } };
        }

        // Append the path to the redirect URL
        // because we resolved a shorter path and the redirect is relative to it
        if (lookup.extraPath) {
            if (data.target === 'content') {
                const redirect = new URL(data.redirect);
                redirect.pathname = joinPath(redirect.pathname, lookup.extraPath);
                data.redirect = redirect.toString();
            } else {
                const redirect = new URL(data.redirect);
                if (redirect.searchParams.has('location')) {
                    redirect.searchParams.set(
                        'location',
                        joinPath(redirect.searchParams.get('location') ?? '', lookup.extraPath)
                    );
                    data.redirect = redirect.toString();
                }
            }
        }

        return { data };
    }

    const changeRequest = data.changeRequest ?? lookup.changeRequest;
    const revision = data.revision ?? lookup.revision;

    return {
        data: {
            ...data,
            canonicalUrl: joinPathWithBaseURL(data.canonicalUrl, lookup.extraPath),
            basePath: joinPath(data.basePath, lookup.basePath ?? ''),
            pathname: getURLLookupPathname(lookup, data),
            ...(changeRequest ? { changeRequest } : {}),
            ...(revision ? { revision } : {}),
        },
    };
}
