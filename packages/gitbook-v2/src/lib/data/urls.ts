import { race, tryCatch } from '@/lib/async';
import { joinPath } from '@/lib/paths';
import { GitBookAPI, type GitBookAPIError, type PublishedSiteContentLookup } from '@gitbook/api';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_USER_AGENT } from '@v2/lib/env';

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

/**
 * For a given GitBook URL, return a list of alternative URLs that could be matched against to lookup the content.
 * The approach is optimized to aim at reusing cached lookup results as much as possible.
 *
 * The cases can be:
 *
 * Custom hostname
 *   - Public content has a custom hostname: docs.company.com/<path>
 *   - Public content has a custom hostname with a share-link: docs.company.com/<link>/<path>
 *   - Public content has a custom hostname with a variant: docs.company.com/v/<variant>/<path>
 *   - Public content has a custom hostname with a variant and a share-link: docs.company.com/<link>/v/<variant>/<path>
 *   - Revisions in a custom hostname: docs.company.com/~/revisions/<id>/<path>
 *   - Changes in a custom hostname: docs.company.com/~/changes/<id>/<path>
 *
 * Custom hostname in the organization or GitBook domain (company.gitbook.io)
 *   - Public content has a custom hostname in the organization: docs.company.com/<space>/<path>
 *   - Public content has a custom hostname in the organization with a share-link: docs.company.com/<space>/<link>/<path>
 *   - Public content has a custom hostname in the organization with a variant: docs.company.com/<space>/v/<variant>/<path>
 *   - Public content has a custom hostname in the organization with a variant and a share-link: docs.company.com/<space>/<link>/v/<variant>/<path>
 */
export function getURLLookupAlternatives(input: URL) {
    const url = normalizeURL(input);

    let basePath: string | undefined = undefined;
    let changeRequest: string | undefined = undefined;
    let revision: string | undefined = undefined;
    const alternatives: Array<{ url: string; extraPath: string; primary: boolean }> = [];

    const pushAlternative = (adding: URL, extraPath: string) => {
        const existing = alternatives.find((alt) => alt.url === adding.toString());
        if (existing) {
            if (existing.extraPath !== extraPath) {
                throw new Error(
                    `Invalid extraPath ${extraPath} for url ${adding.toString()}, already set to ${
                        existing.extraPath
                    }`
                );
            }
            return;
        }

        alternatives.push({
            url: adding.toString(),
            extraPath,
            primary: adding.toString() === url.toString(),
        });
    };

    const pathSegments = url.pathname.slice(1).split('/');
    const tildeIndex = pathSegments.indexOf('~');

    // URL looks like a specific content url (with ~/revisions/ or ~/changes/ in the path)
    // We only start matching after the ~/revisions/ or ~/changes/ segment and we ignore everything before it
    if (
        tildeIndex >= 0 &&
        (pathSegments[tildeIndex + 1] === 'revisions' || pathSegments[tildeIndex + 1] === 'changes')
    ) {
        const tildeIndex = pathSegments.indexOf('~');
        const revisionOrChangeIdIndex = tildeIndex + 2;

        basePath = pathSegments.slice(tildeIndex, revisionOrChangeIdIndex + 1).join('/');
        if (pathSegments[tildeIndex + 1] === 'revisions') {
            revision = pathSegments[revisionOrChangeIdIndex];
        } else {
            changeRequest = pathSegments[revisionOrChangeIdIndex];
        }

        // Match up to the tilde
        const contentURL = new URL(url);
        contentURL.pathname = pathSegments.slice(0, tildeIndex).join('/');
        pushAlternative(contentURL, pathSegments.slice(revisionOrChangeIdIndex + 1).join('/'));
    }

    // URL looks like a collection url (with /v/ in the path)
    // We only start matching after the /v/ segment and we ignore everything before it
    // to avoid potentially matching as a page not found under the default space in the collection
    else if (pathSegments.includes('v')) {
        const collectionURL = new URL(url);
        const vIndex = pathSegments.indexOf('v');
        collectionURL.pathname = pathSegments.slice(0, vIndex + 2).join('/');

        pushAlternative(collectionURL, pathSegments.slice(vIndex + 2).join('/'));
    } else {
        // Match only with the host, if it can be a custom hostname
        // It should cover most cases of custom domains, and with caching, it should be fast.
        if (!url.hostname.includes('.gitbook.io') || pathSegments.length === 0) {
            const noPathURL = new URL(url);
            noPathURL.pathname = '/';

            pushAlternative(noPathURL, url.pathname.slice(1));
        }

        // Otherwise match with the first four segments of the path
        for (let i = 1; i <= 4; i++) {
            if (pathSegments.length >= i) {
                const shortURL = new URL(url);
                shortURL.pathname = pathSegments.slice(0, i).join('/');

                pushAlternative(shortURL, pathSegments.slice(i).join('/'));
            }
        }
    }

    // Mark the longuest entry to lookup as primary
    alternatives.sort((a, b) => b.extraPath.length - a.extraPath.length);
    if (alternatives.length > 0) {
        alternatives[alternatives.length - 1].primary = true;
    }

    return { urls: alternatives, basePath, changeRequest, revision };
}

/**
 * Normalize a URL to remove duplicate slashes and trailing slashes
 * and transform the pathname to lowercase.
 */
export function normalizeURL(url: URL) {
    const result = new URL(url);
    result.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
    return result;
}

/**
 * Strip the search params from a URL
 */
export function stripURLSearch(url: URL): URL {
    const stripped = new URL(url.toString());
    stripped.search = '';
    return stripped;
}
