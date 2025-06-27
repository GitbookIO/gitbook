import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { getPagesTree } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { Root, RootContent } from 'mdast';
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
            return getPagesTree(pages, {
                siteSpaceUrl,
                linker,
                heading: options.heading ? siteSpace.title : undefined,
                withMarkdownPages: options.withMarkdownPages,
            });
        })
    );
    return all.flat();
}
