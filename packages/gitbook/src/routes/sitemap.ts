import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import jsontoxml from 'jsontoxml';

import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { joinPath } from '@/lib/paths';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';

/**
 * Generate a root sitemap that point to all sitemap-pages.xml.
 */
export function serveRootSitemap(context: GitBookSiteContext) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('Root sitemap is only served from the root of the site', {
            status: 404,
        });
    }

    const urls = getUrlsFromSiteStructure(context);

    const xml = jsontoxml(
        [
            {
                name: 'sitemapindex',
                children: urls.map((url) => ({
                    name: 'sitemap',
                    children: [{ name: 'loc', text: url }],
                })),
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

/**
 * Generate a sitemap.xml for the pages of the content.
 */
export function servePagesSitemap(context: GitBookSiteContext) {
    const { linker } = context;
    const pages = getIndexablePages(context.revision.pages);

    const urls = pages.map(({ page, depth }) => {
        // Decay priority with depth
        const priority = 2 ** (-0.25 * depth);
        // Normalize to keep 2 decimals
        const normalizedPriority = Math.floor(100 * priority) / 100;
        const lastModified = page.updatedAt || page.createdAt;

        const url: { loc: string; priority: number; lastmod?: string } = {
            priority: normalizedPriority,
            loc: linker.toAbsoluteURL(
                linker.toPathForPage({
                    pages: context.revision.pages,
                    page,
                })
            ),
        };

        if (lastModified) {
            url.lastmod = new Date(lastModified).toISOString();
        }

        return { url };
    });

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

/**
 * Get Sitemap URLs from site structure.
 */
function getUrlsFromSiteStructure(context: GitBookSiteContext): string[] {
    const { structure } = context;
    switch (structure.type) {
        case 'sections':
            return getUrlsFromSiteSections(
                context,
                getSiteStructureSections(structure, { ignoreGroups: true })
            );
        case 'siteSpaces':
            return getUrlsFromSiteSpaces(context, structure.structure);
        default:
            assertNever(structure);
    }
}

/**
 * Get Sitemap URLs from site sections.
 */
function getUrlsFromSiteSections(
    context: GitBookSiteContext,
    siteSections: SiteSection[]
): string[] {
    const urls = siteSections.map((siteSection) =>
        getUrlsFromSiteSpaces(context, siteSection.siteSpaces)
    );
    return urls.flat();
}

/**
 * Get Sitemap URLs from site spaces.
 */
function getUrlsFromSiteSpaces(context: GitBookSiteContext, siteSpaces: SiteSpace[]): string[] {
    const urls = siteSpaces.map((siteSpace) => {
        if (!siteSpace.urls.published) {
            return null;
        }
        const url = new URL(siteSpace.urls.published);
        url.pathname = joinPath(url.pathname, 'sitemap-pages.xml');
        return context.linker.toAbsoluteURL(context.linker.toLinkForContent(url.toString()));
    }, []);
    return urls.filter(filterOutNullable);
}
