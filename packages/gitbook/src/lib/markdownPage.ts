import path from 'node:path';
import {
    type GitBookAnyContext,
    type GitBookSiteContext,
    fetchSiteContextForSiteSpace,
} from '@/lib/context';
import { DataFetcherError, throwIfDataError } from '@/lib/data';
import type { ResolvedPagePath } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getMarkdownForPagesTree } from '@/routes/llms';
import {
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
    type SiteSpace,
} from '@gitbook/api';
import type { Link, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';
import type { GitBookLinker } from './links';
import { resolveContentRef, resolveStringContentRef } from './references';
import { checkIsAnchor, checkIsExternalURL } from './urls';

/**
 * Generate a markdown version of a page.
 * Handles both regular document pages and group pages (pages with child pages).
 */
export async function getMarkdownForPage(
    context: GitBookSiteContext,
    pageLookup: ResolvedPagePath<RevisionPageDocument | RevisionPageGroup>
): Promise<string> {
    const { page } = pageLookup;

    // Only handle documents and groups
    if (page.type !== RevisionPageType.Document && page.type !== RevisionPageType.Group) {
        throw new DataFetcherError(
            `Page "${pageLookup.page.title}" is not a document or group`,
            400
        );
    }

    // Handle group pages
    if (page.type === RevisionPageType.Group) {
        return servePageGroup(context, page);
    }

    const { data: rawMarkdown, error } = await context.dataFetcher.getRevisionPageMarkdown({
        spaceId: context.space.id,
        revisionId: context.revisionId,
        pageId: page.id,
    });

    if (error) {
        throw error;
    }

    const tree = await fromPageMarkdown(context, {
        markdown: rawMarkdown,
        pagePath: page.path,
    });

    // Handle empty document pages which have children
    if (isEmptyMarkdownPage(tree) && page.pages.length > 0) {
        return servePageGroup(context, page);
    }

    return toPageMarkdown(tree);
}

/**
 * Get markdown for a page that belongs to a different site space than the current context.
 */
export async function getMarkdownForPageInSpace(
    context: GitBookSiteContext,
    siteSpace: SiteSpace,
    page: RevisionPageDocument | RevisionPageGroup
): Promise<string> {
    const siteSpaceContext = await fetchSiteContextForSiteSpace(context, siteSpace);

    // Handle group pages (pages with no content that list their children)
    if (page.type === RevisionPageType.Group) {
        return renderGroupPageMarkdown({ linker: siteSpaceContext.linker, page });
    }

    const rawMarkdown = await throwIfDataError(
        siteSpaceContext.dataFetcher.getRevisionPageMarkdown({
            spaceId: siteSpaceContext.space.id,
            revisionId: siteSpaceContext.revisionId,
            pageId: page.id,
        })
    );

    const tree = await fromPageMarkdown(siteSpaceContext, {
        markdown: rawMarkdown,
        pagePath: page.path,
    });

    // Handle empty document pages which have children (same as getMarkdownForPage)
    if (isEmptyMarkdownPage(tree) && page.pages.length > 0) {
        return renderGroupPageMarkdown({ linker: siteSpaceContext.linker, page });
    }

    return toPageMarkdown(tree);
}

/**
 * Parse markdown from a page, removing frontmatter and rewriting relative links to absolute links.
 * Returns the markdown AST that can be further processed or converted back to markdown using `toPageMarkdown`.
 */
export async function fromPageMarkdown(
    context: GitBookAnyContext,
    args: {
        markdown: string;
        pagePath: string;
    }
): Promise<Root> {
    const tree = fromMarkdown(args.markdown, {
        extensions: [frontmatter(['yaml']), gfm()],
        mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()],
    });

    // Remove frontmatter
    remove(tree, 'yaml');

    await rewriteMarkdownLinks(context, tree, args.pagePath);

    return tree;
}

/**
 * Convert a markdown AST back to markdown.
 */
export function toPageMarkdown(tree: Root): string {
    return toMarkdown(tree, { extensions: [gfmToMarkdown()] });
}

/**
 * Determine if a page is empty.
 * A page is empty if it has no content or only a title.
 */
function isEmptyMarkdownPage(tree: Root): boolean {
    let seenHeading = false;

    for (const node of tree.children) {
        if (node.type === 'heading') {
            if (seenHeading) {
                return false;
            }
            seenHeading = true;
            continue;
        }

        // Allow empty whitespace-only text nodes (e.g., extra newlines)
        if (
            node.type === 'paragraph' &&
            node.children.length === 1 &&
            node.children[0]!.type === 'text' &&
            !node.children[0].value.trim()
        ) {
            continue;
        }

        // Anything else is disallowed
        return false;
    }

    return seenHeading;
}

/**
 * Generate markdown for a group page by creating a page listing.
 * Creates a markdown document with the page title as heading and a list of child pages.
 */
async function servePageGroup(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): Promise<string> {
    return renderGroupPageMarkdown({
        linker: context.linker,
        page,
    });
}

/**
 * Render markdown for a group page with explicit parameters.
 * Use this when rendering a group page from a different space than the current context.
 */
async function renderGroupPageMarkdown(args: {
    linker: GitBookLinker;
    page: RevisionPageDocument | RevisionPageGroup;
}): Promise<string> {
    const { linker, page } = args;
    const indexablePages = getIndexablePages(page.pages);

    const markdownTree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: page.title }],
            },
            ...(await getMarkdownForPagesTree(indexablePages, linker)),
        ],
    };

    return toMarkdown(markdownTree, {
        bullet: '-',
    });
}

/**
 * Re-writes URLs in a markdown content:
 * -
 * - the URL of every relative <a> link so it is expressed from the site-root.
 */
async function rewriteMarkdownLinks(
    context: GitBookAnyContext,
    tree: Root,
    currentPagePath: string
): Promise<Root> {
    const currentDir = path.posix.dirname(currentPagePath);

    const pending: Array<Promise<void>> = [];

    visit(tree, 'link', (node: Link) => {
        const isMention = isMentionLike(node);
        const original = node.url;

        // Skip anchors, mailto:, http(s):, protocol-like
        if (checkIsExternalURL(original) || checkIsAnchor(original)) {
            return;
        }

        const contentRef = resolveStringContentRef(original);

        if (contentRef) {
            pending.push(
                (async () => {
                    const resolved = await resolveContentRef(contentRef, context);
                    if (resolved?.href) {
                        node.url = resolved.href;
                    } else {
                        // We use an absolute URL so that crawler don't follow it.
                        node.url = `broken://${original.startsWith('/') ? original.slice(1) : original}`;
                    }

                    if (isMention) {
                        // Replace the text for mentions as otherwise it contains the raw ref
                        if (resolved) {
                            node.children = [
                                {
                                    type: 'text',
                                    value: resolved.text,
                                },
                            ];
                        } else {
                            node.children = [
                                {
                                    type: 'text',
                                    value: 'Broken mention',
                                },
                            ];
                        }
                        node.title = undefined;
                    }
                })()
            );
        } else {
            // DEPRECATED: to be removed once rollout for getRevisionPageMarkdown is done
            //
            // Resolve against the current page’s directory and strip any leading “/” or "../"
            // Sometimes the path can be "../" if we are on the default section
            // but it means we are just at the root of the site.
            const pathInPage = path.posix
                .normalize(path.posix.join(currentDir, original))
                .replace(/^[\/\.]+/, '');

            node.url = context.linker.toAbsoluteURL(context.linker.toPathInSpace(pathInPage));
        }
    });

    if (pending.length > 0) {
        await Promise.all(pending);
    }

    return tree;
}

function isMentionLike(node: Link) {
    if (node.title === 'mention') {
        return true;
    }

    const singleText =
        node.children.length === 1 && node.children[0]?.type === 'text' ? node.children[0] : null;
    if (!singleText) {
        return false;
    }
    return singleText?.value === node.url;
}
