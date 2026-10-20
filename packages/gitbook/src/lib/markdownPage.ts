import type { Definition, Html, Image, Link, Paragraph, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import path from 'node:path';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

import {
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
    type SiteSpace,
} from '@gitbook/api';

import type { GitBookLinker } from './links';
import { resolveContentRef, resolveStringContentRef } from './references';
import { checkIsAnchor, checkIsExternalURL } from './urls';
import {
    type GitBookAnyContext,
    type GitBookSiteContext,
    fetchSiteContextForSiteSpace,
} from '@/lib/context';
import { DataFetcherError, throwIfDataError } from '@/lib/data';
import type { ResolvedPagePath } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getMarkdownForPagesTree } from '@/routes/llms';

const HTML_ANCHOR_RE = /<a\b([^>]*?)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g;
const HTML_ANCHOR_OPEN_RE = /<a\b([^>]*?)href="([^"]*)"([^>]*)>/g;
const HTML_SRC_RE = /\bsrc="([^"]*)"/g;

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
    insertDescriptionAfterHeading(tree, page.description);

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
    insertDescriptionAfterHeading(tree, page.description);

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

/** Keep page metadata immediately after the title for Markdown consumers. */
function insertDescriptionAfterHeading(tree: Root, description?: string) {
    if (!description) {
        return;
    }

    const headingIndex = tree.children.findIndex(
        (node) => node.type === 'heading' && node.depth === 1
    );
    if (headingIndex === -1) {
        return;
    }

    const descriptionNode: Paragraph = {
        type: 'paragraph',
        children: [{ type: 'text', value: description }],
    };
    tree.children.splice(headingIndex + 1, 0, descriptionNode);
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
    const description = page.type === RevisionPageType.Document ? page.description : undefined;

    const markdownTree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: page.title }],
            },
            ...(description
                ? [
                      {
                          type: 'paragraph',
                          children: [{ type: 'text', value: description }],
                      } satisfies Paragraph,
                  ]
                : []),
            ...(await getMarkdownForPagesTree(indexablePages, linker)),
        ],
    };

    return toMarkdown(markdownTree, {
        bullet: '-',
    });
}

/**
 * Re-writes URLs in a markdown content:
 * - stable content refs (`/pages/:id`, `/spaces/:id/pages/:id`, `/files/:id`...) in links,
 *   images, definitions and in the `href`/`src` of raw HTML blocks are resolved to site URLs.
 * - the URL of every relative <a> link so it is expressed from the site-root.
 */
async function rewriteMarkdownLinks(
    context: GitBookAnyContext,
    tree: Root,
    currentPagePath: string
): Promise<Root> {
    const currentDir = path.posix.dirname(currentPagePath);

    const pending: Promise<void>[] = [];

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
                    node.url = resolved?.href ?? toBrokenURL(original);

                    if (isMention) {
                        // Replace the text for mentions as otherwise it contains the raw ref
                        node.children = [
                            { type: 'text', value: resolved?.text ?? 'Broken mention' },
                        ];
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
                .replace(/^[/.]+/, '');

            node.url = context.linker.toAbsoluteURL(context.linker.toPathInSpace(pathInPage));
        }
    });

    visit(tree, 'image', (node: Image) => {
        pending.push(rewriteNodeURL(context, node));
    });

    visit(tree, 'definition', (node: Definition) => {
        pending.push(rewriteNodeURL(context, node));
    });

    // Blocks markdown cannot express (tables, cards, figures...) are emitted as raw HTML,
    // with the same stable refs in their anchors and images.
    visit(tree, 'html', (node: Html) => {
        pending.push(rewriteHTMLRefs(context, node));
    });

    if (pending.length > 0) {
        await Promise.all(pending);
    }

    return tree;
}

/**
 * Resolve a URL if it is a stable content ref. Returns null for anything else
 * (external URLs, anchors, plain paths) so the caller leaves it untouched.
 */
async function resolveRefURL(
    context: GitBookAnyContext,
    url: string
): Promise<{ url: string; text: string | null } | null> {
    if (checkIsExternalURL(url) || checkIsAnchor(url)) {
        return null;
    }
    const contentRef = resolveStringContentRef(url);
    if (!contentRef) {
        return null;
    }
    const resolved = await resolveContentRef(contentRef, context);
    return { url: resolved?.href ?? toBrokenURL(url), text: resolved?.text ?? null };
}

async function rewriteNodeURL(context: GitBookAnyContext, node: Image | Definition) {
    const resolved = await resolveRefURL(context, node.url);
    if (resolved) {
        node.url = resolved.url;
    }
}

async function rewriteHTMLRefs(context: GitBookAnyContext, node: Html): Promise<void> {
    node.value = await replaceAsync(node.value, HTML_ANCHOR_RE, async (match) => {
        const [full, before = '', href = '', after = '', text = ''] = match;
        const resolved = await resolveRefURL(context, href);
        if (!resolved) {
            return full;
        }
        // The API emits the raw ref as the text; swap it for the resolved title.
        const content = text === href ? escapeHTML(resolved.text ?? 'Broken link') : text;
        return `<a${before}href="${escapeHTML(resolved.url)}"${after}>${content}</a>`;
    });

    node.value = await replaceAsync(node.value, HTML_ANCHOR_OPEN_RE, async (match) => {
        const [full, before = '', href = '', after = ''] = match;
        const resolved = await resolveRefURL(context, href);
        return resolved ? `<a${before}href="${escapeHTML(resolved.url)}"${after}>` : full;
    });

    node.value = await replaceAsync(node.value, HTML_SRC_RE, async (match) => {
        const [full, src = ''] = match;
        const resolved = await resolveRefURL(context, src);
        return resolved ? `src="${escapeHTML(resolved.url)}"` : full;
    });
}

async function replaceAsync(
    value: string,
    re: RegExp,
    replacer: (match: RegExpMatchArray) => Promise<string>
): Promise<string> {
    const replacements = await Promise.all(Array.from(value.matchAll(re), replacer));
    let index = 0;
    return value.replace(re, () => replacements[index++]!);
}

/**
 * Use an absolute URL so that crawlers don't follow it.
 */
function toBrokenURL(original: string): string {
    return `broken://${original.startsWith('/') ? original.slice(1) : original}`;
}

function escapeHTML(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
