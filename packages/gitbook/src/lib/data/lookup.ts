import { race, tryCatch } from '@/lib/async';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';
import { trace } from '@/lib/tracing';
import type { PublishedSiteContentLookup, SiteVisitorPayload } from '@gitbook/api';
import { apiClient } from './api';
import { getExposableError } from './errors';
import { getPublishedContentLookupPlan } from './lookup-plan';
import type { DataFetcherResponse } from './types';

interface LookupPublishedContentByUrlInput {
    url: string;
    redirectOnError: boolean;
    apiToken: string | null;
    visitorPayload: SiteVisitorPayload;
    /** A known lookup URL that can be resolved directly without racing alternatives. */
    urlLookup?: string;
}

/**
 * Lookup a content by its URL using the GitBook resolvePublishedContentByUrl API endpoint.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
export async function lookupPublishedContentByUrl(
    input: LookupPublishedContentByUrlInput
): Promise<DataFetcherResponse<PublishedSiteContentLookup>> {
    const lookup = getPublishedContentLookupPlan(input);

    const resolveAlternative = async (
        alternative: (typeof lookup.urls)[number],
        signal?: AbortSignal
    ) => {
        const api = apiClient({ apiToken: input.apiToken });
        const callResult = await trace(
            {
                operation: 'resolvePublishedContentByUrl',
                name: alternative.url,
            },
            () =>
                tryCatch(
                    api.urls.resolvePublishedContentByUrl(
                        {
                            url: alternative.url,
                            ...(input.visitorPayload ? { visitor: input.visitorPayload } : {}),
                            redirectOnError: input.redirectOnError,
                        },
                        signal ? { signal } : undefined
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
    };

    const result = lookup.direct
        ? await resolveAlternative({
              url: input.urlLookup ?? input.url,
              primary: true,
              extraPath: '',
          })
        : await race(lookup.urls, (alternative, { signal }) =>
              resolveAlternative(alternative, signal)
          );

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
