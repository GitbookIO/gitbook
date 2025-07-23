import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import type { GitBookLinker } from '@/lib/links';
import { joinPath } from '@/lib/paths';
import { type FlatPageEntry, getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { ListItem, Paragraph, Root, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

/**
 * Generate a llms.txt file for the site.
 */
export async function serveLLMsTxt(
    context: GitBookSiteContext,
    {
        withMarkdownPages = false,
    }: {
        /**
         * If true, a markdown extension will be added to the page path.
         */
        withMarkdownPages?: boolean;
    } = {}
) {
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
            ...(await getNodesFromSiteStructure(context, { withMarkdownPages })),
        ],
    };

    return new Response(
        toMarkdown(tree, {
            bullet: '-',
        }),
        {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
            },
        }
    );
}

/**
 * Get MDAST nodes from site structure.
 */
async function getNodesFromSiteStructure(
    context: GitBookSiteContext,
    options: {
        withMarkdownPages: boolean;
    }
): Promise<RootContent[]> {
    switch (context.structure.type) {
        case 'sections':
            return getNodesFromSections(
                context,
                getSiteStructureSections(context.structure, { ignoreGroups: true }),
                { withMarkdownPages: options.withMarkdownPages }
            );
        case 'siteSpaces':
            return getNodesFromSiteSpaces(context, context.structure.structure, {
                heading: true,
                withMarkdownPages: options.withMarkdownPages,
            });
        default:
            assertNever(context.structure);
    }
}

/**
 * Get MDAST nodes from site sections.
 */
async function getNodesFromSections(
    context: GitBookSiteContext,
    siteSections: SiteSection[],
    options: {
        withMarkdownPages: boolean;
    }
): Promise<RootContent[]> {
    const all = await Promise.all(
        siteSections.map(async (siteSection): Promise<RootContent[]> => {
            const siteSpaceNodes = await getNodesFromSiteSpaces(context, siteSection.siteSpaces, {
                heading: false,
                withMarkdownPages: options.withMarkdownPages,
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

        /**
         * If true, a markdown extension will be added to the page path.
         */
        withMarkdownPages: boolean;
    }
): Promise<RootContent[]> {
    const { dataFetcher, linker } = context;

    const all = await Promise.all(
        siteSpaces.map(async (siteSpace): Promise<RootContent[]> => {
            const siteSpaceUrl = siteSpace.urls.published;
            if (!siteSpaceUrl) {
                return [];
            }
            const revision = await throwIfDataError(
                dataFetcher.getRevision({
                    spaceId: siteSpace.space.id,
                    revisionId: siteSpace.space.revision,
                })
            );
            const pages = getIndexablePages(revision.pages);

            const nodes: RootContent[] = [];

            // Add the space title as a heading
            if (options.heading) {
                nodes.push({
                    type: 'heading',
                    depth: 2,
                    children: [{ type: 'text', value: siteSpace.title }],
                });
            }

            // Add the pages as a list
            nodes.push(
                ...(await getMarkdownForPagesTree(pages, {
                    siteSpaceUrl,
                    linker,
                    withMarkdownPages: options.withMarkdownPages,
                }))
            );

            return nodes;
        })
    );
    return all.flat();
}

/**
 * Returns a list of markdown nodes for a pages tree.
 */
export async function getMarkdownForPagesTree(
    pages: FlatPageEntry[],
    options: {
        siteSpaceUrl: string;
        linker: GitBookLinker;
        withMarkdownPages?: boolean;
    }
): Promise<RootContent[]> {
    const { siteSpaceUrl, linker } = options;

    const listChildren = await Promise.all(
        pages.map(async ({ page }): Promise<ListItem> => {
            const pageURL = new URL(siteSpaceUrl);
            pageURL.pathname = joinPath(pageURL.pathname, page.path);
            if (options.withMarkdownPages) {
                pageURL.pathname = `${pageURL.pathname}.md`;
            }

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
    nodes.push({
        type: 'list',
        spread: false,
        children: listChildren,
    });
    return nodes;
}
