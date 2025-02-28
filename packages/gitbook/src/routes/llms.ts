import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { ListItem, Paragraph, Root, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

import { getPagePath } from '@/lib/pages';
import { joinPath } from '@/lib/paths';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';

/**
 * Generate a llms.txt file for the site.
 */
export async function serveLLMsTxt(context: GitBookSiteContext) {
    const { site } = context;

    if (!checkIsRootSiteContext(context)) {
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
            ...(await getNodesFromSiteStructure(context)),
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
async function getNodesFromSiteStructure(context: GitBookSiteContext): Promise<RootContent[]> {
    switch (context.structure.type) {
        case 'sections':
            return getNodesFromSections(
                context,
                getSiteStructureSections(context.structure, { ignoreGroups: true })
            );
        case 'siteSpaces':
            return getNodesFromSiteSpaces(context, context.structure.structure, { heading: true });
        default:
            assertNever(context.structure);
    }
}

/**
 * Get MDAST nodes from site sections.
 */
async function getNodesFromSections(
    context: GitBookSiteContext,
    siteSections: SiteSection[]
): Promise<RootContent[]> {
    const all = await Promise.all(
        siteSections.map(async (siteSection): Promise<RootContent[]> => {
            const siteSpaceNodes = await getNodesFromSiteSpaces(context, siteSection.siteSpaces, {
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
    context: GitBookSiteContext,
    siteSpaces: SiteSpace[],
    options: {
        /**
         * Includes a heading for each site space.
         */
        heading?: boolean;
    }
): Promise<RootContent[]> {
    const { dataFetcher, linker } = context;

    const all = await Promise.all(
        siteSpaces.map(async (siteSpace): Promise<RootContent[]> => {
            const siteSpaceUrl = siteSpace.urls.published;
            if (!siteSpaceUrl) {
                return [];
            }
            const rootPages = await dataFetcher.getRevisionPages({
                spaceId: siteSpace.space.id,
                revisionId: siteSpace.space.revision,
                metadata: false,
            });
            const pages = getIndexablePages(rootPages);
            const listChildren = await Promise.all(
                pages.map(async ({ page }): Promise<ListItem> => {
                    const pageURL = new URL(siteSpaceUrl);
                    pageURL.pathname = joinPath(pageURL.pathname, getPagePath(rootPages, page));

                    const url = linker.toLinkForContent(pageURL.toString());
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
