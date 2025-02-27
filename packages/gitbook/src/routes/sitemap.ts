import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import jsontoxml from 'jsontoxml';

import { joinPath } from '@/lib/paths';
import { getSiteStructureSections } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';

/**
 * Generate a root sitemap that point to all sitemap-pages.xml.
 */
export async function serveRootSitemap(context: GitBookSiteContext) {
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
 * Get Sitemap URLs from site structure.
 */
function getUrlsFromSiteStructure(context: GitBookSiteContext): string[] {
    const { structure } = context;
    switch (structure.type) {
        case 'sections':
            return getUrlsFromSiteSections(context, getSiteStructureSections(structure));
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
        return context.linker.toLinkForContent(url.toString());
    }, []);
    return urls.filter(filterOutNullable);
}
