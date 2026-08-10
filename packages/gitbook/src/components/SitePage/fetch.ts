import type { GitBookSiteContext } from '@/lib/context';
import { redirect } from 'next/navigation';

import {
    SITE_REDIRECT_SOURCE_PATH_MAX_LENGTH,
    SITE_REDIRECT_SOURCE_PATH_PATTERN,
} from '@gitbook/api';

import { getDataOrNull } from '@/lib/data';
import { resolvePageId, resolvePagePath } from '@/lib/pages';
import { withLeadingSlash } from '@/lib/paths';

export interface PagePathParams {
    pathname?: string | string[];
}

export interface PageIdParams {
    pageId: string;
}

export type PageParams = PagePathParams | PageIdParams;

/**
 * Fetch all the data needed to render the site page.
 * Optimized to fetch in parallel as much as possible.
 */
export async function fetchPageData(context: GitBookSiteContext, params: PageParams) {
    const pageTarget = await resolvePage(context, params);

    return {
        context: {
            ...context,
            page: pageTarget?.page,
        },
        pageTarget,
    };
}

/**
 * Resolve a page from the params.
 * If the path can't be found, we try to resolve it from the API to handle redirects.
 */
async function resolvePage(context: GitBookSiteContext, params: PagePathParams | PageIdParams) {
    const { organizationId, site, space, revision, shareKey, linker, revisionId } = context;

    if ('pageId' in params) {
        return resolvePageId(revision.pages, params.pageId);
    }

    const rawPathname = getPathnameParam(params);
    const pathname = rawPathname.toLowerCase();

    // When resolving a page, we use the lowercased pathname
    const page = resolvePagePath(revision.pages, pathname);
    if (page) {
        return page;
    }

    // We don't test path that are too long as GitBook doesn't support them and will return a 404 anyway.
    // API has a limit of less than 512 characters for the source path, so we use the same limit here.
    if (rawPathname.length < SITE_REDIRECT_SOURCE_PATH_MAX_LENGTH) {
        const SITE_REDIRECT_SOURCE_PATH_REGEX = new RegExp(SITE_REDIRECT_SOURCE_PATH_PATTERN);
        const redirectPathname = withLeadingSlash(rawPathname);
        // If a page can't be found, we try with the API, in case we have a redirect at site level.
        const redirectSources = new Set(
            [
                // Test the pathname relative to the root
                // For example hello/world -> section/variant/hello/world
                linker.toRelativePathInSite(linker.toPathInSpace(redirectPathname)),
                // Test the pathname relative to the content/space
                // For example hello/world -> /hello/world
                redirectPathname,
            ]
                .map(toSiteRedirectSourceCandidate)
                .filter((source) => SITE_REDIRECT_SOURCE_PATH_REGEX.test(source))
        );

        for (const source of redirectSources) {
            // We try to resolve the site redirect
            const resolvedSiteRedirect =
                source.length < SITE_REDIRECT_SOURCE_PATH_MAX_LENGTH &&
                (await getDataOrNull(
                    context.dataFetcher.getSiteRedirectBySource({
                        organizationId,
                        siteId: site.id,
                        source,
                        siteShareKey: shareKey,
                    })
                ));
            if (resolvedSiteRedirect) {
                return redirect(linker.toLinkForContent(resolvedSiteRedirect.target));
            }
        }

        // If page still can't be found, we try with the API, in case we have a redirect at space level.
        // We use the raw pathname to handle special/malformed redirects setup by users in the GitSync.
        // The page rendering will take care of redirecting to a normalized pathname.
        const resolved = await getDataOrNull(
            context.dataFetcher.getRevisionPageByPath({
                spaceId: space.id,
                revisionId: revisionId,
                path: rawPathname,
            })
        );
        if (resolved) {
            return resolvePageId(revision.pages, resolved.id);
        }
    }

    return undefined;
}

/**
 * Transform a pathname into a candidate source for site redirect matching.
 * We also encode each segment to handle special characters in redirects.
 */
function toSiteRedirectSourceCandidate(pathname: string): string {
    const normalized = withLeadingSlash(pathname);
    return withLeadingSlash(
        normalized
            .slice(1)
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/')
    );
}

/**
 * Get the page path from the params.
 */
export function getPathnameParam(params: PagePathParams): string {
    const { pathname } = params;

    if (!pathname) {
        return '';
    }

    if (typeof pathname === 'string') {
        return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    }

    return pathname.map((part) => decodeURIComponent(part)).join('/');
}
