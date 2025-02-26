import type { SiteSection, SiteSpace, SiteStructure } from '@gitbook/api';
import assertNever from 'assert-never';
import type { ListItem, Paragraph, Root, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { NextRequest } from 'next/server';

import { getPublishedContentSite, getRevisionPages } from '@/lib/api';
import { getAbsoluteHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { joinPath } from '@/lib/paths';
import { checkIsRootPointer, getSiteContentPointer } from '@/lib/pointer';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';

export const runtime = 'edge';

/**
 * Generate a llms.txt file for the site.
 */
export async function GET(req: NextRequest) {
    const pointer = await getSiteContentPointer();

    const { structure: siteStructure, site } = await getPublishedContentSite({
        organizationId: pointer.organizationId,
        siteId: pointer.siteId,
        siteShareKey: pointer.siteShareKey,
    });

    if (!checkIsRootPointer(pointer, siteStructure)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const tree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: site.title }],
            },
            ...(await getNodesFromSiteStructure(siteStructure)),
        ],
    };

    return new Response(
        toMarkdown(tree, {
            bullet: '-',
        }),
        {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        }
    );
}

/**
 * Get MDAST nodes from site structure.
 */
async function getNodesFromSiteStructure(siteStructure: SiteStructure): Promise<RootContent[]> {
    switch (siteStructure.type) {
        case 'sections':
            return getNodesFromSections(getSiteStructureSections(siteStructure));
        case 'siteSpaces':
            return getNodesFromSiteSpaces(siteStructure.structure, { heading: true });
        default:
            assertNever(siteStructure);
    }
}

/**
 * Get MDAST nodes from site sections.
 */
async function getNodesFromSections(siteSections: SiteSection[]): Promise<RootContent[]> {
    const all = await Promise.all(
        siteSections.map(async (siteSection): Promise<RootContent[]> => {
            const siteSpaceNodes = await getNodesFromSiteSpaces(siteSection.siteSpaces, {
                heading: false,
            });
            return [
                {
                    type: 'heading',
                    depth: 2,
                    children: [{ type: 'text', value: siteSection.title }],
                },
                ...siteSpaceNodes,
            ];
        })
    );
    return all.flat();
}

/**
 * Get MDAST nodes from site spaces.
 */
async function getNodesFromSiteSpaces(
    siteSpaces: SiteSpace[],
    options: {
        /**
         * Includes a heading for each site space.
         */
        heading?: boolean;
    }
): Promise<RootContent[]> {
    const all = await Promise.all(
        siteSpaces.map(async (siteSpace): Promise<RootContent[]> => {
            const siteSpaceUrl = siteSpace.urls.published;
            if (!siteSpaceUrl) {
                return [];
            }
            const rootPages = await getRevisionPages(siteSpace.space.id, siteSpace.space.revision, {
                metadata: false,
            });
            const pages = getIndexablePages(rootPages);
            const listChildren = await Promise.all(
                pages.map(async ({ page }): Promise<ListItem> => {
                    const url = await getAbsoluteHref(
                        joinPath(new URL(siteSpaceUrl).pathname, getPagePath(rootPages, page)),
                        true
                    );
                    const children: Paragraph['children'] = [
                        {
                            type: 'link',
                            url,
                            children: [{ type: 'text', value: page.title }],
                        },
                    ];
                    if (page.description) {
                        children.push({ type: 'text', value: `: ${page.description}` });
                    }
                    return {
                        type: 'listItem',
                        children: [{ type: 'paragraph', children }],
                    };
                })
            );
            const nodes: RootContent[] = [];
            if (options.heading) {
                nodes.push({
                    type: 'heading',
                    depth: 2,
                    children: [{ type: 'text', value: siteSpace.title }],
                });
            }
            nodes.push({
                type: 'list',
                spread: false,
                children: listChildren,
            });
            return nodes;
        })
    );
    return all.flat();
}
