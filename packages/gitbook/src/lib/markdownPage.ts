import type { GitBookSiteContext } from '@/lib/context';
import { DataFetcherError, throwIfDataError } from '@/lib/data';
import type { ResolvedPagePath } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getFallbackSiteSpacePath } from '@/lib/sites';
import { getMarkdownForPagesTree } from '@/routes/llms';
import {
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
    type SiteSpace,
} from '@gitbook/api';
import type { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { remove } from 'unist-util-remove';
import { type GitBookLinker, relativeToAbsoluteLinks } from './links';

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

    const tree = fromPageMarkdown({
        linker: context.linker,
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
    const { dataFetcher } = context;
    const spaceBasePath = getFallbackSiteSpacePath(context, siteSpace);
    const linker = context.linker.withOtherSiteSpace({
        spaceBasePath,
    });

    // Handle group pages (pages with no content that list their children)
    if (page.type === RevisionPageType.Group) {
        const siteSpaceUrl = siteSpace.urls.published;
        if (!siteSpaceUrl) {
            throw new DataFetcherError(`Page "${page.title}" is not published`, 404);
        }
        return renderGroupPageMarkdown({ siteSpaceUrl, linker, page });
    }

    const rawMarkdown = await throwIfDataError(
        dataFetcher.getRevisionPageMarkdown({
            spaceId: siteSpace.space.id,
            revisionId: siteSpace.space.revision,
            pageId: page.id,
        })
    );

    const tree = fromPageMarkdown({
        linker,
        markdown: rawMarkdown,
        pagePath: page.path,
    });

    // Handle empty document pages which have children (same as getMarkdownForPage)
    if (isEmptyMarkdownPage(tree) && page.pages.length > 0) {
        const siteSpaceUrl = siteSpace.urls.published;
        if (!siteSpaceUrl) {
            throw new DataFetcherError(`Page "${page.title}" is not published`, 404);
        }
        return renderGroupPageMarkdown({ siteSpaceUrl, linker, page });
    }

    return toPageMarkdown(tree);
}

/**
 * Parse markdown from a page, removing frontmatter and rewriting relative links to absolute links.
 * Returns the markdown AST that can be further processed or converted back to markdown using `toPageMarkdown`.
 */
export function fromPageMarkdown(args: {
    linker: GitBookLinker;
    markdown: string;
    pagePath: string;
}): Root {
    const tree = fromMarkdown(args.markdown, {
        extensions: [frontmatter(['yaml']), gfm()],
        mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()],
    });

    // Remove frontmatter
    remove(tree, 'yaml');

    relativeToAbsoluteLinks(args.linker, tree, args.pagePath);

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
    const siteSpaceUrl = context.space.urls.published;
    if (!siteSpaceUrl) {
        throw new DataFetcherError(`Page "${page.title}" is not published`, 404);
    }

    return renderGroupPageMarkdown({
        siteSpaceUrl,
        linker: context.linker,
        page,
    });
}

/**
 * Render markdown for a group page with explicit parameters.
 * Use this when rendering a group page from a different space than the current context.
 */
async function renderGroupPageMarkdown(args: {
    siteSpaceUrl: string;
    linker: GitBookLinker;
    page: RevisionPageDocument | RevisionPageGroup;
}): Promise<string> {
    const { siteSpaceUrl, linker, page } = args;
    const indexablePages = getIndexablePages(page.pages);

    const markdownTree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: page.title }],
            },
            ...(await getMarkdownForPagesTree(indexablePages, {
                siteSpaceUrl,
                linker,
                withMarkdownPages: true,
            })),
        ],
    };

    return toMarkdown(markdownTree, {
        bullet: '-',
    });
}
