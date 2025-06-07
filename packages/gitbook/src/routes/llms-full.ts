import path from 'node:path';
import { joinPath } from '@/lib/paths';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import { checkIsAnchor, checkIsExternalURL } from '@/lib/urls';
import type { RevisionPageDocument, SiteSection, SiteSpace } from '@gitbook/api';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';
import { throwIfDataError } from '@v2/lib/data';
import assertNever from 'assert-never';
import type { Link, Paragraph, Root, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

/**
 * Generate a llms-full.txt file for the site.
 */
export async function serveLLMsFullTxt(context: GitBookSiteContext) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const tree: Root = {
        type: 'root',
        children: await getNodesFromSiteStructure(context),
    };

    return new Response(toMarkdown(tree, { extensions: [gfmToMarkdown()] }), {
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
            return getNodesFromSiteSpaces(context, context.structure.structure, '');
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
            const siteSpaceNodes = await getNodesFromSiteSpaces(
                context,
                siteSection.siteSpaces,
                siteSection.path
            );
            return siteSpaceNodes;
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
    basePath: string
): Promise<RootContent[]> {
    const { dataFetcher } = context;

    const all = await Promise.all(
        siteSpaces.map(async (siteSpace): Promise<RootContent[]> => {
            const siteSpaceUrl = siteSpace.urls.published;
            if (!siteSpaceUrl) {
                return [];
            }
            const rootPages = await throwIfDataError(
                dataFetcher.getRevisionPages({
                    spaceId: siteSpace.space.id,
                    revisionId: siteSpace.space.revision,
                    metadata: false,
                })
            );
            const pages = getIndexablePages(rootPages)
                // We currently limit the number of pages to 500 to avoid generating a too large markdown output
                // and because of limits with the server on how many requests / files can be opened.
                .slice(0, 500);
            const nodes = (
                await Promise.all(
                    pages.map(async ({ page }): Promise<RootContent[]> => {
                        if (page.type !== 'document' || !page.documentId) {
                            return [];
                        }

                        return getNodesFromPage(
                            context,
                            siteSpace,
                            page,
                            joinPath(basePath, siteSpace.path)
                        );
                    })
                )
            ).flat();
            return nodes;
        })
    );
    return all.flat();
}

/**
 * Get MDAST nodes from a page.
 */
async function getNodesFromPage(
    context: GitBookSiteContext,
    siteSpace: SiteSpace,
    page: RevisionPageDocument,
    basePath: string
): Promise<RootContent[]> {
    const { dataFetcher } = context;

    const pageMarkdown = await throwIfDataError(
        dataFetcher.getRevisionPageMarkdown({
            spaceId: siteSpace.space.id,
            revisionId: siteSpace.space.revision,
            pageId: page.id,
        })
    );

    const tree = fromMarkdown(pageMarkdown, {
        extensions: [frontmatter(['yaml']), gfm()],
        mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()],
    });

    // Remove frontmatter
    remove(tree, 'yaml');

    if (page.description) {
        // The first node is the page title as a H1, we insert the description as a paragraph
        // after it.
        const descriptionNode: Paragraph = {
            type: 'paragraph',
            children: [{ type: 'text', value: page.description }],
        };
        tree.children.splice(1, 0, descriptionNode);
    }

    // Rewrite relative links to absolute links
    transformLinks(context, tree, { currentPagePath: page.path, basePath });

    return tree.children;
}

/**
 * Re-writes the URL of every relative <a> link so it is expressed from the site-root.
 */
export function transformLinks(
    context: GitBookSiteContext,
    tree: Root,
    options: { currentPagePath: string; basePath: string }
): Root {
    const { linker } = context;
    const { currentPagePath, basePath } = options;
    const currentDir = path.posix.dirname(currentPagePath);

    visit(tree, 'link', (node: Link) => {
        const original = node.url;

        // Skip anchors, mailto:, http(s):, protocol-like, or already-rooted paths
        if (checkIsExternalURL(original) || checkIsAnchor(original) || original.startsWith('/')) {
            return;
        }

        // Resolve against the current page’s directory and strip any leading “/”
        const pathInSite = path.posix
            .normalize(path.posix.join(basePath, currentDir, original))
            .replace(/^\/+/, '');

        node.url = linker.toPathInSite(pathInSite);
    });

    return tree;
}
