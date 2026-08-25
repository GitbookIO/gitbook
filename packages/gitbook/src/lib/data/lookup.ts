import type { GitBookAPI, PublishedSiteContentLookup, SiteVisitorPayload } from '@gitbook/api';

import { apiClient } from './api';
import { getExposableError } from './errors';
import type { DataFetcherResponse } from './types';
import { getURLLookupAlternatives, stripURLSearch } from './urls';
import { isAPITokenExpired } from '@/lib/api-token';
import { race, tryCatch } from '@/lib/async';
import { getLogger } from '@/lib/logger';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';
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
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
export async function lookupPublishedContentByUrl(
    input: LookupPublishedContentByUrlInput
): Promise<DataFetcherResponse<PublishedSiteContentLookup>> {
    const lookupURL = new URL(input.url);
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const api = apiClient({ apiToken: input.apiToken });
        const resolveURL = (cacheBust?: string) =>
            tryCatch(
                api.urls.resolvePublishedContentByUrl(
                    {
                        url: alternative.url,
                        ...(input.visitorPayload ? { visitor: input.visitorPayload } : {}),
                        redirectOnError: input.redirectOnError,
                        // Temporary: the API caches this POST by request body, so an unknown
                        // field is enough to miss the cache and get a freshly minted token.
                        ...(cacheBust ? { cacheBust } : {}),
                    } as ResolveBody, //TODO: remove cast when we are sure that everything is good
                    { signal }
                )
            );

        let callResult = await trace(
            {
                operation: 'resolvePublishedContentByUrl',
                name: alternative.url,
            },
            () => resolveURL()
        );

        const resolved = callResult.error ? null : callResult.data.data;
        if (
            resolved &&
            !('redirect' in resolved) &&
            // Only alternatives we'd actually accept are worth a second round-trip.
            (alternative.primary || resolved.complete) &&
            isAPITokenExpired(resolved.apiToken)
        ) {
            getLogger().warn(
                'resolvePublishedContentByUrl returned an expired API token, retrying without cache'
            );
            callResult = await trace(
                {
                    operation: 'resolvePublishedContentByUrlUncached',
                    name: alternative.url,
                },
                // The value only needs to differ between calls, so `Math.random` is enough.
                () => resolveURL(Math.random().toString(36).slice(2))
            );
        }

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
