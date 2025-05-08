import { race, tryCatch } from '@/lib/async';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';
import { trace } from '@/lib/tracing';
import type { GitBookAPI, PublishedSiteContentLookup, SiteVisitorPayload } from '@gitbook/api';
import { apiClient } from './api';
import { getExposableError } from './errors';
import type { DataFetcherResponse } from './types';
import { getURLLookupAlternatives, stripURLSearch } from './urls';

interface LookupPublishedContentByUrlInput {
    url: string;
    redirectOnError: boolean;
    apiToken: string | null;
}

type FetchLookupAPIResponse =
    | {
          data?: undefined;
          error: Error;
      }
    | {
          data: Awaited<ReturnType<GitBookAPI['urls']['resolvePublishedContentByUrl']>>;
          error?: undefined;
      };

/**
 * Lookup a content by its URL using the GitBook resolvePublishedContentByUrl API endpoint.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
export async function resolvePublishedContentByUrl(
    input: LookupPublishedContentByUrlInput & { visitorPayload: SiteVisitorPayload }
) {
    return lookupPublishedContentByUrl({
        url: input.url,
        fetchLookupAPIResult: ({ url, signal }) => {
            const api = apiClient({ apiToken: input.apiToken });
            return trace(
                {
                    operation: 'resolvePublishedContentByUrl',
                    name: url,
                },
                () =>
                    tryCatch(
                        api.urls.resolvePublishedContentByUrl(
                            {
                                url,
                                ...(input.visitorPayload ? { visitor: input.visitorPayload } : {}),
                                redirectOnError: input.redirectOnError,
                            },
                            { signal }
                        )
                    )
            );
        },
    });
}

/**
 * Lookup a content by its URL using the GitBook getPublishedContentByUrl API endpoint.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 *
 * @deprecated use resolvePublishedContentByUrl.
 *
 */
export async function getPublishedContentByURL(
    input: LookupPublishedContentByUrlInput & {
        visitorAuthToken: string | null;
    }
) {
    return lookupPublishedContentByUrl({
        url: input.url,
        fetchLookupAPIResult: ({ url, signal }) => {
            const api = apiClient({ apiToken: input.apiToken });
            return trace(
                {
                    operation: 'getPublishedContentByURL',
                    name: url,
                },
                () =>
                    tryCatch(
                        api.urls.getPublishedContentByUrl(
                            {
                                url,
                                visitorAuthToken: input.visitorAuthToken ?? undefined,
                                redirectOnError: input.redirectOnError,
                                // @ts-expect-error - cacheVersion is not a real query param
                                cacheVersion: 'v2',
                            },
                            { signal }
                        )
                    )
            );
        },
    });
}

async function lookupPublishedContentByUrl(input: {
    url: string;
    fetchLookupAPIResult: (args: {
        url: string;
        signal: AbortSignal;
    }) => Promise<FetchLookupAPIResponse>;
}): Promise<DataFetcherResponse<PublishedSiteContentLookup>> {
    const lookupURL = new URL(input.url);
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const callResult = await input.fetchLookupAPIResult({
            url: alternative.url,
            signal,
        });

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
