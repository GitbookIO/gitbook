import type { Definition, Html, Image, Link, Paragraph, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { type DefaultTreeAdapterMap, parseFragment } from 'parse5';
import { remove } from 'unist-util-remove';
import { visit } from 'unist-util-visit';

import {
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
    type SiteSpace,
} from '@gitbook/api';

import { escapeHTML } from './html';
import type { GitBookLinker } from './links';
import { withTrailingSlash } from './paths';
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

const SRCSET_CANDIDATE_RE = /(\S*[^,\s])(?:\s+[^,]*)?(?:,|$)/g;

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

/** Resolve exported Markdown destinations in their source context. */
async function rewriteMarkdownLinks(
    context: GitBookAnyContext,
    tree: Root,
    currentPagePath: string
): Promise<Root> {
    const pending: Promise<void>[] = [];

    visit(tree, 'link', (node: Link) => {
        const isMention = isMentionLike(node);
        const original = node.url;
        pending.push(
            (async () => {
                const resolved = await resolveRefURL(context, original, currentPagePath);
                if (!resolved) {
                    return;
                }
                node.url = resolved.url;
                if (isMention && resolveStringContentRef(original)) {
                    node.children = [{ type: 'text', value: resolved.text ?? 'Broken mention' }];
                    node.title = undefined;
                }
            })()
        );
    });

    visit(tree, 'image', (node: Image) => {
        pending.push(rewriteNodeURL(context, node, currentPagePath));
    });

    visit(tree, 'definition', (node: Definition) => {
        pending.push(rewriteNodeURL(context, node, currentPagePath));
    });

    // Blocks markdown cannot express (tables, cards, figures...) are emitted as raw HTML,
    // with the same stable refs in their anchors and images.
    visit(tree, 'html', (node: Html) => {
        pending.push(rewriteHTMLRefs(context, node, currentPagePath));
    });

    if (pending.length > 0) {
        await Promise.all(pending);
    }

    return tree;
}

/**
 * Resolve Markdown destinations independently of the source document origin.
 */
async function resolveRefURL(
    context: GitBookAnyContext,
    url: string,
    currentPagePath: string
): Promise<{ url: string; text: string | null } | null> {
    if (checkIsExternalURL(url) || checkIsAnchor(url)) {
        return null;
    }
    const contentRef = resolveStringContentRef(url);
    if (!contentRef) {
        const pageURL = currentPagePath
            ? context.linker.toAbsoluteURL(
                  context.linker.toPathForPagePath({ path: currentPagePath })
              )
            : withTrailingSlash(context.linker.toAbsoluteURL(context.linker.toPathInSpace('')));
        if (!URL.canParse(url, pageURL)) {
            return null;
        }
        return { url: new URL(url, pageURL).toString(), text: url };
    }
    const resolved = await resolveContentRef(contentRef, context);
    return {
        url: resolved ? context.linker.toAbsoluteURL(resolved.href) : toBrokenURL(url),
        text: resolved?.text ?? null,
    };
}

async function rewriteNodeURL(
    context: GitBookAnyContext,
    node: Image | Definition,
    currentPagePath: string
) {
    const resolved = await resolveRefURL(context, node.url, currentPagePath);
    if (resolved) {
        node.url = resolved.url;
    }
}

async function rewriteHTMLRefs(
    context: GitBookAnyContext,
    node: Html,
    currentPagePath: string
): Promise<void> {
    const fragment = parseFragment(node.value, { sourceCodeLocationInfo: true });
    const elements: DefaultTreeAdapterMap['element'][] = [];
    function collect(element: DefaultTreeAdapterMap['node']) {
        if ('tagName' in element) {
            elements.push(element);
        }
        if ('childNodes' in element) {
            element.childNodes.forEach(collect);
        }
        if ('content' in element) {
            collect(element.content);
        }
    }
    collect(fragment);

    const replacements = new Map<number, { start: number; end: number; value: string }>();
    await Promise.all(
        elements.map(async (element) => {
            for (const attr of element.attrs) {
                if (attr.name !== 'href' && attr.name !== 'src' && attr.name !== 'srcset') {
                    continue;
                }
                const name = attr.prefix ? `${attr.prefix}:${attr.name}` : attr.name;
                const location = element.sourceCodeLocation?.attrs?.[name];
                if (!location) {
                    continue;
                }
                let value: string;
                if (attr.name === 'srcset') {
                    value = await replaceAsync(
                        attr.value,
                        SRCSET_CANDIDATE_RE,
                        async (candidate) => {
                            const [full, url = ''] = candidate;
                            const resolved = await resolveRefURL(context, url, currentPagePath);
                            return resolved ? resolved.url + full.slice(url.length) : full;
                        }
                    );
                    if (value === attr.value) {
                        continue;
                    }
                } else {
                    const resolved = await resolveRefURL(context, attr.value, currentPagePath);
                    if (!resolved) {
                        continue;
                    }
                    value = resolved.url;
                    const text = element.childNodes[0];
                    if (
                        element.tagName === 'a' &&
                        attr.name === 'href' &&
                        resolveStringContentRef(attr.value) &&
                        element.childNodes.length === 1 &&
                        text &&
                        'value' in text &&
                        text.value === attr.value &&
                        text.sourceCodeLocation
                    ) {
                        replacements.set(text.sourceCodeLocation.startOffset, {
                            start: text.sourceCodeLocation.startOffset,
                            end: text.sourceCodeLocation.endOffset,
                            value: escapeHTML(resolved.text ?? 'Broken link'),
                        });
                    }
                }
                replacements.set(location.startOffset, {
                    start: location.startOffset,
                    end: location.endOffset,
                    value: `${name}="${escapeHTML(value)}"`,
                });
            }
        })
    );
    for (const replacement of [...replacements.values()].sort((a, b) => b.start - a.start)) {
        node.value =
            node.value.slice(0, replacement.start) +
            replacement.value +
            node.value.slice(replacement.end);
    }
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
