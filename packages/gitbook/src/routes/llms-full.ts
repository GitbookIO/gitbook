import path from 'node:path';
import { joinPath } from '@/lib/paths';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import { checkIsAnchor, checkIsExternalURL } from '@/lib/urls';
import type { RevisionPageDocument, SiteSection, SiteSpace } from '@gitbook/api';
import { type GitBookSiteContext, checkIsRootSiteContext } from '@v2/lib/context';
import { throwIfDataError } from '@v2/lib/data';
import assertNever from 'assert-never';
import type { Link, Paragraph, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { pMapIterable } from 'p-map';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

// We limit the concurrency to 100 to avoid reaching limit with concurrent requests
// or file descriptor limits.
const MAX_CONCURRENCY = 100;

/**
 * Generate a llms-full.txt file for the site.
 * As the result can be large, we stream it as we generate it.
 */
export async function serveLLMsFullTxt(context: GitBookSiteContext) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    return new Response(
        new ReadableStream<Uint8Array>({
            async pull(controller) {
                await streamMarkdownFromSiteStructure(context, controller);
                controller.close();
            },
        }),
        {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
            },
        }
    );
}

/**
 * Stream markdown from site structure.
 */
async function streamMarkdownFromSiteStructure(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>
): Promise<void> {
    switch (context.structure.type) {
        case 'sections':
            return streamMarkdownFromSections(
                context,
                stream,
                getSiteStructureSections(context.structure, { ignoreGroups: true })
            );
        case 'siteSpaces':
            return streamMarkdownFromSiteSpaces(context, stream, context.structure.structure, '');
        default:
            assertNever(context.structure);
    }
}

/**
 * Stream markdown from site sections.
 */
async function streamMarkdownFromSections(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    siteSections: SiteSection[]
): Promise<void> {
    for (const siteSection of siteSections) {
        await streamMarkdownFromSiteSpaces(
            context,
            stream,
            siteSection.siteSpaces,
            siteSection.path
        );
    }
}

/**
 * Stream markdown from site spaces.
 */
async function streamMarkdownFromSiteSpaces(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    siteSpaces: SiteSpace[],
    basePath: string
): Promise<void> {
    const { dataFetcher } = context;

    for (const siteSpace of siteSpaces) {
        const siteSpaceUrl = siteSpace.urls.published;
        if (!siteSpaceUrl) {
            continue;
        }
        const rootPages = await throwIfDataError(
            dataFetcher.getRevisionPages({
                spaceId: siteSpace.space.id,
                revisionId: siteSpace.space.revision,
                metadata: false,
            })
        );
        const pages = getIndexablePages(rootPages);

        for await (const markdown of pMapIterable(
            pages,
            async ({ page }) => {
                if (page.type !== 'document') {
                    return '';
                }

                return getMarkdownForPage(
                    context,
                    siteSpace,
                    page,
                    joinPath(basePath, siteSpace.path)
                );
            },
            {
                concurrency: MAX_CONCURRENCY,
            }
        )) {
            stream.enqueue(new TextEncoder().encode(markdown));
        }
    }
}

/**
 * Get markdown from a page.
 */
async function getMarkdownForPage(
    context: GitBookSiteContext,
    siteSpace: SiteSpace,
    page: RevisionPageDocument,
    basePath: string
): Promise<string> {
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

    const markdown = toMarkdown(tree, { extensions: [gfmToMarkdown()] });
    return `${markdown}\n\n`;
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
