import type { GitBookSiteContext } from '@v2/lib/context';
import { redirect } from 'next/navigation';

import { resolvePageId, resolvePagePath } from '@/lib/pages';
import { withLeadingSlash } from '@/lib/paths';
import { getDataOrNull } from '@v2/lib/data';

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
    const { organizationId, site, space, revisionId, pages, shareKey, linker } = context;

    if ('pageId' in params) {
        return resolvePageId(pages, params.pageId);
    }

    const rawPathname = getPathnameParam(params);
    const pathname = rawPathname.toLowerCase();

    // When resolving a page, we use the lowercased pathname
    const page = resolvePagePath(pages, pathname);
    if (page) {
        return page;
    }

    // We don't test path that are too long as GitBook doesn't support them and will return a 404 anyway.
    if (rawPathname.length <= 512) {
        // If page can't be found, we try with the API, in case we have a redirect at space level.
        // We use the raw pathname to handle special/malformed redirects setup by users in the GitSync.
        // The page rendering will take care of redirecting to a normalized pathname.
        const resolved = await getDataOrNull(
            context.dataFetcher.getRevisionPageByPath({
                spaceId: space.id,
                revisionId,
                path: rawPathname,
            })
        );
        if (resolved) {
            return resolvePageId(pages, resolved.id);
        }

        // If a page still can't be found, we try with the API, in case we have a redirect at site level.
        const redirectPathname = withLeadingSlash(rawPathname);
        if (/^\/[a-zA-Z0-9-_.\/]+[a-zA-Z0-9-_.]$/.test(redirectPathname)) {
            const redirectSources = new Set<string>([
                // Test the pathname relative to the root
                // For example hello/world -> section/variant/hello/world
                withLeadingSlash(
                    linker.toRelativePathInSite(linker.toPathInSpace(redirectPathname))
                ),
                // Test the pathname relative to the content/space
                // For example hello/world -> /hello/world
                redirectPathname,
            ]);
            for (const source of redirectSources) {
                const resolvedSiteRedirect = await getDataOrNull(
                    context.dataFetcher.getSiteRedirectBySource({
                        organizationId,
                        siteId: site.id,
                        source,
                        siteShareKey: shareKey,
                    })
                );
                if (resolvedSiteRedirect) {
                    return redirect(linker.toLinkForContent(resolvedSiteRedirect.target));
                }
            }
        }
    }

    return undefined;
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
