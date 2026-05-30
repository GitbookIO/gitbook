import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { type GitBookLinker, linkerWithMarkdownPages } from '@/lib/links';
import { resolveFirstDocument } from '@/lib/pages';
import { type FlatPageEntry, getIndexablePages } from '@/lib/sitemap';
import {
    filterSiteSpacesByLocale,
    getFallbackSiteSpacePath,
    getLocalizedTitle,
    getSiteStructureSections,
} from '@/lib/sites';
import type { SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { ListItem, Paragraph, Root, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

/**
 * Generate a llms.txt file for the site.
 */
export async function serveLLMsTxt(baseContext: GitBookSiteContext) {
    const { site } = baseContext;

    if (!checkIsRootSiteContext(baseContext)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const context = {
        ...baseContext,
        linker: linkerWithMarkdownPages(baseContext.linker),
    };

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

    let output = toMarkdown(tree, {
        bullet: '-',
    });

    output += renderAskFooter(context);

    return new Response(output, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
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
            return getNodesFromSiteSpaces(context, context.structure.structure, {
                heading: true,
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
    siteSections: SiteSection[]
): Promise<RootContent[]> {
    const currentLanguage = context.locale;
    const all = await Promise.all(
        siteSections.map(async (siteSection): Promise<RootContent[]> => {
            const siteSpaceNodes = await getNodesFromSiteSpaces(context, siteSection.siteSpaces, {
                heading: false,
            });
            return [
                {
                    type: 'heading',
                    depth: 2,
                    children: [
                        { type: 'text', value: getLocalizedTitle(siteSection, currentLanguage) },
                    ],
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

    const filteredSiteSpaces = filterSiteSpacesByLocale(siteSpaces, context.locale);

    const all = await Promise.all(
        filteredSiteSpaces.map(async (siteSpace): Promise<RootContent[]> => {
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
                    children: [
                        {
                            type: 'text',
                            value: getLocalizedTitle(siteSpace, context.locale),
                        },
                    ],
                });
            }

            const siteSpaceLinker = linkerWithMarkdownPages(
                linker.withOtherSiteSpace({
                    spaceBasePath: getFallbackSiteSpacePath(context, siteSpace),
                })
            );

            // Add the pages as a list
            nodes.push(...(await getMarkdownForPagesTree(pages, siteSpaceLinker)));

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
    linker: GitBookLinker
): Promise<RootContent[]> {
    const listChildren = await Promise.all(
        pages.map(async ({ page }): Promise<ListItem> => {
            const url = linker.toAbsoluteURL(
                linker.toPathForPagePath({
                    path: page.path,
                })
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
    nodes.push({
        type: 'list',
        spread: false,
        children: listChildren,
    });
    return nodes;
}

function renderAskFooter(context: GitBookSiteContext) {
    return `\n\n---\n\n# Agent Instructions: Querying This Documentation

If you need additional information, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on a page URL with the \`ask\` query parameter:

\`\`\`
GET ${context.linker.toAbsoluteURL(
        context.linker.toPathForPagePath({
            path: resolveFirstDocument(context.revision.pages, [])?.page.path ?? 'index',
        })
    )}?ask=<question>
\`\`\`

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
`;
}
