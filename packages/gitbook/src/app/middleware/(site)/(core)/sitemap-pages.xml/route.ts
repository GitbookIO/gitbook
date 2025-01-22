import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import jsontoxml from 'jsontoxml';

import { getRevisionPages, getSpace } from '@/lib/api';
import { getAbsoluteHref, getBasePath } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';
import { isPageIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a sitemap.xml for the current space.
 */
export async function GET() {
    const pointer = await getSiteContentPointer();

    const revisionId = await (async () => {
        if (pointer.revisionId) {
            return pointer.revisionId;
        }
        const space = await getSpace(pointer.spaceId, pointer.siteShareKey);
        return space.revision;
    })();

    const rootPages = await getRevisionPages(pointer.spaceId, revisionId, { metadata: false });

    const pages = flattenPages(rootPages, (page) => !page.hidden && isPageIndexable([], page));

    const urls = await Promise.all(
        pages.map(async ({ page, depth }) => {
            // Decay priority with depth
            const priority = Math.pow(2, -0.25 * depth);
            // Normalize to keep 2 decimals
            const normalizedPriority = Math.floor(100 * priority) / 100;
            const lastModified = page.updatedAt || page.createdAt;

            const url: { loc: string; priority: number; lastmod?: string } = {
                priority: normalizedPriority,
                loc: await getAbsoluteHref(getPagePath(rootPages, page), true),
            };

            if (lastModified) {
                url.lastmod = new Date(lastModified).toISOString();
            }

            return { url };
        }),
    );

    const xml = jsontoxml(
        [
            {
                name: 'urlset',
                children: urls,
                attrs: {
                    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
                },
            },
        ],
        {
            xmlHeader: true,
            prettyPrint: true,
        },
    );

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}

type FlatPageEntry = { page: RevisionPageDocument; depth: number };

function flattenPages(
    rootPags: RevisionPage[],
    filter: (page: RevisionPageDocument | RevisionPageGroup) => boolean,
): FlatPageEntry[] {
    const flattenPage = (
        page: RevisionPageDocument | RevisionPageGroup,
        depth: number,
    ): FlatPageEntry[] => {
        const allowed = filter(page);
        if (!allowed) {
            return [];
        }

        return [
            ...(page.type === 'document' ? [{ page, depth }] : []),
            ...page.pages.flatMap((child) =>
                child.type === 'document' ? flattenPage(child, depth + 1) : [],
            ),
        ];
    };

    return rootPags.flatMap((page) =>
        page.type === 'group' || page.type === 'document' ? flattenPage(page, 0) : [],
    );
}
