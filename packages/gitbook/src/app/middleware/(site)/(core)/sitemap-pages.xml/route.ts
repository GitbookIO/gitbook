import jsontoxml from 'jsontoxml';

import { getRevisionPages, getSpace } from '@/lib/api';
import { getAbsoluteHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';
import { getIndexablePages } from '@/lib/sitemap';

export const runtime = 'edge';

/**
 * Generate a sitemap.xml for the current section / space.
 */
export async function GET() {
    const pointer = await getSiteContentPointer();

    const revisionId =
        pointer.revisionId ?? (await getSpace(pointer.spaceId, pointer.siteShareKey)).revision;

    const rootPages = await getRevisionPages(pointer.spaceId, revisionId, { metadata: false });

    const pages = getIndexablePages(rootPages);

    const urls = await Promise.all(
        pages.map(async ({ page, depth }) => {
            // Decay priority with depth
            const priority = 2 ** (-0.25 * depth);
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
        })
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
        }
    );

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
