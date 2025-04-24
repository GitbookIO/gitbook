import { race, tryCatch } from '@/lib/async';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';
import { trace } from '@/lib/tracing';
import type { PublishedSiteContentLookup } from '@gitbook/api';
import { apiClient } from './api';
import { getExposableError } from './errors';
import type { DataFetcherResponse } from './types';
import { getURLLookupAlternatives, stripURLSearch } from './urls';

/**
 * Lookup a content by its URL using the GitBook API.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
export async function getPublishedContentByURL(input: {
    url: string;
    visitorAuthToken: string | null;
    redirectOnError: boolean;
    apiToken: string | null;
}): Promise<DataFetcherResponse<PublishedSiteContentLookup>> {
    const lookupURL = new URL(input.url);
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const api = await apiClient({ apiToken: input.apiToken });

        const callResult = await trace(
            {
                operation: 'getPublishedContentByURL',
                name: alternative.url,
            },
            () =>
                tryCatch(
                    api.urls.getPublishedContentByUrl(
                        {
                            url: alternative.url,
                            visitorAuthToken: input.visitorAuthToken ?? undefined,
                            redirectOnError: input.redirectOnError,

                            // As this endpoint is cached by our API, we version the request
                            // to void getting stale data with missing properties.
                            // this could be improved by ensuring our API cache layer is versioned
                            // or invalidated when needed
                            // @ts-expect-error - cacheVersion is not a real query param
                            cacheVersion: 'v2',
                        },
                        {
                            signal,
                        }
                    )
                )
        );

        if (callResult.error) {
            if (alternative.primary) {
                // We only return an error for the primary alternative (full URL),
                // as other parts could result in errors due to the URL being incomplete (share links, etc).
                return { error: callResult.error };
            }
            return null;
        }

        const {
            data: { data },
        } = callResult;

        if ('redirect' in data) {
            if (alternative.primary) {
                // Append the path to the redirect URL
                // because we might have matched a shorter path and the redirect is relative to it
                if (alternative.extraPath) {
                    if (data.target === 'content') {
                        const redirect = new URL(data.redirect);
                        redirect.pathname = joinPath(redirect.pathname, alternative.extraPath);
                        data.redirect = redirect.toString();
                    } else {
                        const redirect = new URL(data.redirect);
                        if (redirect.searchParams.has('location')) {
                            redirect.searchParams.set(
                                'location',
                                joinPath(
                                    redirect.searchParams.get('location') ?? '',
                                    alternative.extraPath
                                )
                            );
                            data.redirect = redirect.toString();
                        }
                    }
                }

                return { data };
            }

            return null;
        }

        /**
         * We use the following criteria to determine if the lookup result is the right one:
         * - the primary alternative was resolved (because that's the longest or most inclusive path)
         * - the resolution of the site URL is complete (because we want to resolve the deepest path possible)
         *
         * In both cases, the idea is to use the deepest/longest/most inclusive path to resolve the content.
         */
        if (alternative.primary || ('site' in data && data.complete)) {
            const changeRequest = data.changeRequest ?? lookup.changeRequest;
            const revision = data.revision ?? lookup.revision;

            const siteResult: PublishedSiteContentLookup = {
                ...data,
                canonicalUrl: joinPathWithBaseURL(data.canonicalUrl, alternative.extraPath),
                basePath: joinPath(data.basePath, lookup.basePath ?? ''),
                pathname: joinPath(data.pathname, alternative.extraPath),
                ...(changeRequest ? { changeRequest } : {}),
                ...(revision ? { revision } : {}),
            };
            return { data: siteResult };
        }

        return null;
    });

    if (!result) {
        return {
            error: {
                code: 404,
                message: 'No content found',
            },
        };
    }

    if (result.error) {
        return {
            error: getExposableError(result.error),
        };
    }

    return {
        data: result.data,
    };
}
