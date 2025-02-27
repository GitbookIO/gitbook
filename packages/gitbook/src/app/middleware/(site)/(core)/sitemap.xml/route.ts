import type { SiteSection, SiteSpace, SiteStructure } from '@gitbook/api';
import assertNever from 'assert-never';
import jsontoxml from 'jsontoxml';

import { getPublishedContentSite } from '@/lib/api';
import { joinPath } from '@/lib/paths';
import { checkIsRootPointer, getSiteContentPointer } from '@/lib/pointer';
import { getSiteStructureSections } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';

export const runtime = 'edge';

/**
 * Generate a root sitemap that point to all sitemap-pages.xml.
 */
export async function GET() {
    const pointer = await getSiteContentPointer();

    const { structure: siteStructure } = await getPublishedContentSite({
        organizationId: pointer.organizationId,
        siteId: pointer.siteId,
        siteShareKey: pointer.siteShareKey,
    });

    if (!checkIsRootPointer(pointer, siteStructure)) {
        return new Response('Root sitemap is only served from the root of the site', {
            status: 404,
        });
    }

    const urls = await getUrlsFromSiteStructure(siteStructure);

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
async function getUrlsFromSiteStructure(siteStructure: SiteStructure): Promise<string[]> {
    switch (siteStructure.type) {
        case 'sections':
            return getUrlsFromSiteSections(
                getSiteStructureSections(siteStructure, { ignoreGroups: true })
            );
        case 'siteSpaces':
            return getUrlsFromSiteSpaces(siteStructure.structure);
        default:
            assertNever(siteStructure);
    }
}

/**
 * Get Sitemap URLs from site sections.
 */
async function getUrlsFromSiteSections(siteSections: SiteSection[]): Promise<string[]> {
    const urls = await Promise.all(
        siteSections.map(async (siteSection) => getUrlsFromSiteSpaces(siteSection.siteSpaces), [])
    );
    return urls.flat();
}

/**
 * Get Sitemap URLs from site spaces.
 */
async function getUrlsFromSiteSpaces(siteSpaces: SiteSpace[]): Promise<string[]> {
    const urls = await Promise.all(
        siteSpaces.map(async (siteSpace) => {
            if (!siteSpace.urls.published) {
                return null;
            }
            const url = new URL(siteSpace.urls.published);
            url.pathname = joinPath(url.pathname, 'sitemap-pages.xml');
            return url.toString();
        }, [])
    );
    return urls.filter(filterOutNullable);
}
