import { race, tryCatch } from '@/lib/async';
import { joinPath } from '@/lib/paths';
import { GitBookAPI, type GitBookAPIError, type PublishedSiteContentLookup } from '@gitbook/api';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';
import { getURLLookupAlternatives, stripURLSearch } from './urls';

/**
 * Lookup a content by its URL using the GitBook API.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
export async function getPublishedContentByURL(input: {
    url: string;
    visitorAuthToken: string | null;
    redirectOnError: boolean;
}): Promise<
    | { data: PublishedSiteContentLookup; error?: undefined }
    | { data?: undefined; error: Error | GitBookAPIError }
> {
    const lookupURL = new URL(input.url);
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const api = new GitBookAPI({
            authToken: GITBOOK_API_TOKEN ?? undefined,
            endpoint: GITBOOK_API_URL,
            userAgent: GITBOOK_USER_AGENT,
        });

        const callResult = await tryCatch(
            api.urls.getPublishedContentByUrl(
                {
                    url: alternative.url,
                    visitorAuthToken: input.visitorAuthToken ?? undefined,
                    redirectOnError: input.redirectOnError,
                    cache: true,
                },
                {
                    signal,
                    headers: {
                        'x-gitbook-force-cache': 'true',
                    },
                }
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
            const siteResult: PublishedSiteContentLookup = {
                ...data,
                changeRequest: data.changeRequest ?? lookup.changeRequest,
                revision: data.revision ?? lookup.revision,
                basePath: joinPath(data.basePath, lookup.basePath ?? ''),
                pathname: joinPath(data.pathname, alternative.extraPath),
            };
            return { data: siteResult };
        }

        return null;
    });

    if (!result) {
        return {
            error: new Error('No content found'),
        };
    }

    return result;
}
