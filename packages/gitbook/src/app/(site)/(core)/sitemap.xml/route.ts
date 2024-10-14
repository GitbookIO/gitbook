import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import jsontoxml from 'jsontoxml';
import { NextRequest } from 'next/server';

import { getSpaceContentData } from '@/lib/api';
import { absoluteHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';
import { isPageIndexable } from '@/lib/seo';

export const runtime = 'edge';

/**
 * Generate a sitemap.xml for the current space.
 */
export async function GET(req: NextRequest) {
    const pointer = getSiteContentPointer();
    const { pages: rootPages } = await getSpaceContentData(pointer, pointer.siteShareKey);

    const pages = flattenPages(rootPages, (page) => !page.hidden && isPageIndexable([], page));
    const urls = pages.map(({ page, depth }) => {
        // Decay priority with depth
        const priority = Math.pow(2, -0.25 * depth);
        // Normalize to keep 2 decimals
        const normalizedPriority = Math.floor(100 * priority) / 100;

        const lastModified = page.updatedAt || page.createdAt;

        return {
            url: {
                loc: absoluteHref(getPagePath(rootPages, page), true),
                priority: normalizedPriority,
                ...(lastModified
                    ? {
                          // lastmod format is YYYY-MM-DD
                          lastmod: new Date(lastModified).toISOString().split('T')[0],
                      }
                    : {}),
            },
        };
    });

    const xml = jsontoxml(
        [
            {
                name: 'urlset',
                children: urls,
                attrs: {
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
                    'xsi:schemaLocation':
                        'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
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
