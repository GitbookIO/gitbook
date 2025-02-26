import type { GitBookSiteContext } from '@v2/lib/context';
import { redirect } from 'next/navigation';

import { resolvePageId, resolvePagePath } from '@/lib/pages';

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
    const { organizationId, site, space, revisionId, pages, shareKey } = context;

    if ('pageId' in params) {
        return resolvePageId(pages, params.pageId);
    }

    const rawPathname = getPathnameParam(params);
    const pathname = normalizePathname(rawPathname);

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
        const resolved = await context.dataFetcher.getRevisionPageByPath({
            spaceId: space.id,
            revisionId,
            path: rawPathname,
        });
        if (resolved) {
            return resolvePageId(pages, resolved.id);
        }

        // If a page still can't be found, we try with the API, in case we have a redirect at site level.
        const resolvedSiteRedirect = await context.dataFetcher.getSiteRedirectBySource({
            organizationId,
            siteId: site.id,
            source: rawPathname.startsWith('/') ? rawPathname : `/${rawPathname}`,
            siteShareKey: shareKey,
        });
        if (resolvedSiteRedirect) {
            return redirect(resolvedSiteRedirect.target);
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

/**
 * Normalize the URL pathname into the format used in the revision page path.
 */
export function normalizePathname(pathname: string) {
    return pathname.toLowerCase();
}
