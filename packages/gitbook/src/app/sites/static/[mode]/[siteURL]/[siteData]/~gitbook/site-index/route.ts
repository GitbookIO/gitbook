import {
    type RevisionPage,
    type RevisionPageDocument,
    type RevisionPageGroup,
    SiteVisibility,
} from '@gitbook/api';
import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { throwIfDataError } from '@/lib/data';
import { isPageIndexable } from '@/lib/seo';
import {
    findSiteSpaceBy,
    getFallbackSiteSpacePath,
    getLocalizedTitle,
    listAllSiteSpaces,
} from '@/lib/sites';

interface Breadcrumb {
    label: string;
    icon?: string;
    emoji?: string;
}

interface RawIndexPage {
    id: string;
    title: string;
    pathname: string;
    siteSpaceId: string;
    lang?: string;
    icon?: string;
    emoji?: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
}

type AncestorPage = RevisionPageDocument | RevisionPageGroup;

interface IndexPageEntry {
    page: RevisionPageDocument;
    ancestors: AncestorPage[];
}

/**
 * Walk the page tree and return all indexable document pages together with
 * their ancestor chain (groups + parent documents), enabling breadcrumb generation.
 */
function getIndexablePagesWithAncestors(
    rootPages: RevisionPage[],
    ancestors: AncestorPage[] = []
): IndexPageEntry[] {
    const results: IndexPageEntry[] = [];

    for (const page of rootPages) {
        if (page.type === 'link' || page.type === 'computed') continue;
        if (page.hidden || !isPageIndexable([], page)) continue;

        if (page.type === 'document') {
            results.push({ page, ancestors });
            // Recurse into children with this document as an ancestor
            if (page.pages?.length) {
                results.push(
                    ...getIndexablePagesWithAncestors(page.pages as RevisionPage[], [
                        ...ancestors,
                        page,
                    ])
                );
            }
        } else if (page.type === 'group') {
            // Groups themselves are not documents — push them only as ancestors
            if (page.pages?.length) {
                results.push(
                    ...getIndexablePagesWithAncestors(page.pages as RevisionPage[], [
                        ...ancestors,
                        page,
                    ])
                );
            }
        }
    }

    return results;
}

export const revalidate = 86400; // 1 day in seconds
export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    const { dataFetcher, linker, structure } = context;

    const visibleSpaces = listAllSiteSpaces(structure).filter((ss) => !ss.hidden);

    const revisions = await Promise.all(
        visibleSpaces.map((ss) =>
            throwIfDataError(
                dataFetcher.getRevision({
                    spaceId: ss.space.id,
                    revisionId: ss.space.revision,
                })
            )
        )
    );

    const seen = new Set<string>();
    const pages: RawIndexPage[] = [];

    for (let i = 0; i < visibleSpaces.length; i++) {
        const siteSpace = visibleSpaces[i]!;
        const revision = revisions[i]!;
        const forkedLinker = linker.withOtherSiteSpace({
            spaceBasePath: getFallbackSiteSpacePath(context, siteSpace),
        });

        const lang = siteSpace.space.language ?? undefined;
        const sectionInfo = findSiteSpaceBy(structure, (ss) => ss.id === siteSpace.id);
        const { siteSection, siteSectionGroup } = sectionInfo ?? {};

        for (const { page, ancestors } of getIndexablePagesWithAncestors(revision.pages)) {
            const cacheKey = `${siteSpace.id}:${page.id}`;
            if (seen.has(cacheKey)) continue;
            seen.add(cacheKey);

            const breadcrumbs: Breadcrumb[] = [
                siteSectionGroup
                    ? {
                          label: getLocalizedTitle(siteSectionGroup, lang),
                          icon: siteSectionGroup.icon ?? undefined,
                      }
                    : undefined,
                siteSection
                    ? {
                          label: getLocalizedTitle(siteSection, lang),
                          icon: siteSection.icon ?? undefined,
                      }
                    : undefined,
                ...ancestors.map((a) => ({
                    label: a.title,
                    icon: a.icon ?? undefined,
                    emoji: a.emoji ?? undefined,
                })),
            ].filter((c) => c !== undefined);

            pages.push({
                id: page.id,
                title: page.title,
                pathname: forkedLinker.toPathForPage({ pages: revision.pages, page }),
                siteSpaceId: siteSpace.id,
                lang,
                icon: page.icon ?? undefined,
                emoji: page.emoji ?? undefined,
                description: page.description ?? undefined,
                breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : undefined,
            });
        }
    }

    // We only cache the search index on the client if the site is public or unlisted, to avoid leaking information about private sites.
    // For private sites, we set `Cache-Control: no-store` to prevent caching at all.
    const shouldCacheOnClient =
        context.site.visibility === SiteVisibility.Public ||
        context.site.visibility === SiteVisibility.Unlisted;

    return new Response(
        JSON.stringify({
            // We include a version number in the response to allow future changes to the format without breaking clients that might have cached the old format.
            version: 1,
            pages,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                // Cache for 5 minutes on the client, 1 day on the CDN, and allow serving stale content while revalidating for 1 day
                'Cache-Control': shouldCacheOnClient
                    ? 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400'
                    : 'no-store',
            },
        }
    );
}
