import { permanentRedirect, redirect } from 'next/navigation';

import {
    CustomizationPageActionType,
    type RevisionPageDocument,
    SITE_REDIRECT_SOURCE_PATH_MAX_LENGTH,
    SITE_REDIRECT_SOURCE_PATH_PATTERN,
} from '@gitbook/api';

import { type GitBookSiteContext, fetchSiteContextForSiteSpace } from '@/lib/context';
import { getDataOrNull } from '@/lib/data';
import { type ResolvedPagePath, resolvePageId } from '@/lib/pages';
import { withLeadingSlash } from '@/lib/paths';
import { findSiteSpaceByUrl, resolveSiteSpacePagePath } from '@/lib/sites';

const MAX_PAGE_URL_REDIRECTS = 5;

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
    let pageTarget = await resolvePage(context, params);

    // Revision trees omit metadata for cache efficiency, so load it only when this action needs the Git path.
    if (
        pageTarget &&
        !pageTarget.page.git &&
        context.space.gitSync?.url &&
        context.customization.pageActions.items.includes(CustomizationPageActionType.Git)
    ) {
        const response = await context.dataFetcher.getRevisionPageByPath({
            spaceId: context.space.id,
            revisionId: context.revisionId,
            path: pageTarget.page.path,
            metadata: true,
            cachedMetadata: true,
        });
        const pageWithMetadata = response.data;

        if (pageWithMetadata?.type === 'document' && pageWithMetadata.git) {
            pageTarget = {
                ...pageTarget,
                page: {
                    ...pageTarget.page,
                    git: pageWithMetadata.git,
                },
            };
        }
    }

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
    const { revision } = context;

    if ('pageId' in params) {
        return resolvePageId(revision.pages, params.pageId);
    }

    const rawPathname = getPathnameParam(params);
    const pathname = rawPathname.toLowerCase();

    // When resolving a page, we use the lowercased pathname
    const page = resolveSiteSpacePagePath(context.siteSpace, revision.pages, pathname);
    if (page) {
        return page;
    }

    const fallback = await resolveMissingPagePath(context, rawPathname);
    if (fallback?.type === 'redirect') {
        return fallback.permanent
            ? permanentRedirect(fallback.destination)
            : redirect(fallback.destination);
    }

    return fallback?.page;
}

export type MissingPagePathResolution =
    | {
          type: 'redirect';
          /** Destination as returned by `linker.toLinkForContent` (absolute path or URL). */
          destination: string;
          permanent: boolean;
      }
    | {
          type: 'page';
          page: ResolvedPagePath<RevisionPageDocument>;
      };

/**
 * Resolve a pathname that doesn't match any page of the revision, using site-level and space-level redirects.
 */
export async function resolveMissingPagePath(
    context: GitBookSiteContext,
    rawPathname: string
): Promise<MissingPagePathResolution | undefined> {
    const { organizationId, site, space, revision, shareKey, linker, revisionId } = context;

    // We don't test path that are too long as GitBook doesn't support them and will return a 404 anyway.
    // API has a limit of less than 512 characters for the source path, so we use the same limit here.
    if (rawPathname.length >= SITE_REDIRECT_SOURCE_PATH_MAX_LENGTH) {
        return undefined;
    }

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
            const isPublicLiveContext =
                !shareKey &&
                !context.changeRequest &&
                !context.preview &&
                context.revisionId === context.space.revision &&
                !context.isLoggedInVisitor;
            return {
                type: 'redirect',
                destination: linker.toLinkForContent(resolvedSiteRedirect.target),
                permanent: Boolean(
                    resolvedSiteRedirect.redirect?.permanent &&
                    !resolvedSiteRedirect.redirect.draft &&
                    isPublicLiveContext
                ),
            };
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
    const page = resolved ? resolvePageId(revision.pages, resolved.id) : undefined;
    return page ? { type: 'page', page } : undefined;
}

/**
 * Resolve a page of the site from its full URL, following site and space redirects like a browser would.
 */
export async function resolveSitePageFromURL(
    context: GitBookSiteContext,
    url: string,
    redirectsLeft = MAX_PAGE_URL_REDIRECTS
) {
    const match = findSiteSpaceByUrl(context.structure, url);
    if (!match) {
        return null;
    }

    const siteSpaceContext = await fetchSiteContextForSiteSpace(context, match.siteSpace);
    const page = resolveSiteSpacePagePath(
        match.siteSpace,
        siteSpaceContext.revision.pages,
        match.pagePath
    );
    if (page) {
        return { siteSpace: match.siteSpace, page: page.page };
    }

    const fallback = await resolveMissingPagePath(siteSpaceContext, match.pagePath);
    if (fallback?.type === 'page') {
        return { siteSpace: match.siteSpace, page: fallback.page.page };
    }

    // Destinations outside the site are full URLs and can't be one of its pages.
    if (
        fallback?.type === 'redirect' &&
        fallback.destination.startsWith('/') &&
        redirectsLeft > 0
    ) {
        return resolveSitePageFromURL(
            context,
            siteSpaceContext.linker.toAbsoluteURL(fallback.destination),
            redirectsLeft - 1
        );
    }

    return null;
}

/**
 * Transform a pathname into a candidate source for site redirect matching.
 * The pathname is already percent-encoded, so each segment is decoded before being encoded
 * again: redirect sources store special characters percent-encoded exactly once.
 */
function toSiteRedirectSourceCandidate(pathname: string): string {
    const normalized = withLeadingSlash(pathname);
    return withLeadingSlash(
        normalized
            .slice(1)
            .split('/')
            .map((segment) => encodeURIComponent(safeDecodeURIComponent(segment)))
            .join('/')
    );
}

function safeDecodeURIComponent(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
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
 * Get the lowercased pathname to redirect a missing page to, or `null` if there is none.
 * The pathname is percent-encoded, so lowercase its decoded form and re-encode it canonically:
 * any other encoding would make the middleware redirect again, or loop.
 */
export function getLowercasePathnameRedirect(rawPathname: string): string | null {
    let changed = false;
    const segments: string[] = [];

    for (const segment of rawPathname.split('/')) {
        let decoded: string;
        try {
            decoded = decodeURIComponent(segment);
        } catch {
            return null;
        }

        const lowercased = decoded.toLowerCase();
        changed ||= lowercased !== decoded;
        segments.push(lowercased);
    }

    if (!changed) {
        return null;
    }

    return encodeURLPathname(segments.join('/')).slice(1);
}

/**
 * Percent-encode a decoded pathname the way the URL parser does, the canonical form `normalizeURL` produces.
 */
function encodeURLPathname(pathname: string): string {
    const url = new URL('https://gitbook.invalid');
    url.pathname = pathname;
    return url.pathname;
}
