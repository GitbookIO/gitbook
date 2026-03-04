import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { throwIfDataError } from '@/lib/data';
import { getIndexablePages } from '@/lib/sitemap';
import { listAllSiteSpaces } from '@/lib/sites';

interface RawIndexPage {
    id: string;
    title: string;
    pathname: string;
    lang?: string;
    icon?: string;
    emoji?: string;
    description?: string;
}

export const revalidate = 86400; // 1 day
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
        const forkedLinker = linker.withOtherSiteSpace({ spaceBasePath: siteSpace.path });

        for (const { page } of getIndexablePages(revision.pages)) {
            if (seen.has(page.id)) continue;
            seen.add(page.id);

            pages.push({
                id: page.id,
                title: page.title,
                pathname: forkedLinker.toPathForPage({ pages: revision.pages, page }),
                lang: siteSpace.space.language ?? undefined,
                icon: page.icon ?? undefined,
                emoji: page.emoji ?? undefined,
                description: page.description ?? undefined,
            });
        }
    }

    return new Response(JSON.stringify({ pages }), {
        headers: {
            'Content-Type': 'application/json',
            // Cache for 5 minutes on the client, 1 day on the CDN, and allow serving stale content while revalidating for 1 day
            'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400',
        },
    });
}
