import type { GitBookLinker } from '@/lib/links';
import { joinPath } from '@/lib/paths';
import type { FlatPageEntry } from '@/lib/sitemap';
import {
    type Revision,
    type RevisionPage,
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';
import type { ListItem, Paragraph, RootContent } from 'mdast';

export type AncestorRevisionPage = RevisionPageDocument | RevisionPageGroup;

interface ResolvePageOptions {
    /**
     * Whether to include page groups in the results.
     */
    includePageGroup?: boolean;
}

/**
 * Resolves a page path to find the corresponding page document or group.
 */
export function resolvePagePath(
    rootPages: Revision['pages'],
    pagePath: string,
    options?: { includePageGroup: true }
):
    | { page: RevisionPageGroup | RevisionPageDocument; ancestors: AncestorRevisionPage[] }
    | undefined;
export function resolvePagePath(
    rootPages: Revision['pages'],
    pagePath: string,
    options?: ResolvePageOptions
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined;
export function resolvePagePath(
    rootPages: Revision['pages'],
    pagePath: string,
    options?: ResolvePageOptions
):
    | { page: RevisionPageGroup | RevisionPageDocument; ancestors: AncestorRevisionPage[] }
    | undefined {
    // Handle empty path by returning the first document page
    if (!pagePath) {
        const firstPage = resolveFirstDocument(rootPages, []);
        return firstPage ?? undefined;
    }

    return findPageByPath(rootPages, [], pagePath, options);
}

/**
 * Recursively searches through pages to find one matching the given path.
 */
function findPageByPath(
    pages: RevisionPage[],
    ancestors: AncestorRevisionPage[],
    targetPath: string,
    options: ResolvePageOptions = {}
):
    | { page: RevisionPageGroup | RevisionPageDocument; ancestors: AncestorRevisionPage[] }
    | undefined {
    for (const page of pages) {
        // Skip non-navigable page types
        if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
            continue;
        }

        // If this isn't the target path, search recursively in child pages
        if (page.path !== targetPath) {
            const childResult = findPageByPath(
                page.pages,
                [...ancestors, page],
                targetPath,
                options
            );
            if (childResult) {
                return childResult;
            }
            continue;
        }

        // Found the target path - handle based on page type and options
        const { includePageGroup = false } = options;

        if (page.type === RevisionPageType.Group && includePageGroup) {
            return { page, ancestors };
        }

        // For document pages, or when we need to resolve a group to its first document
        const resolvedPage = resolvePageDocument(page, ancestors);
        return resolvedPage ?? undefined;
    }

    return undefined;
}

/**
 * Find a page by its ID in a revision.
 */
export function resolvePageId(
    rootPages: Revision['pages'],
    pageId: string
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    const iteratePages = (
        pages: RevisionPage[],
        ancestors: AncestorRevisionPage[]
    ): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined => {
        for (const page of pages) {
            if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
                continue;
            }

            if (page.id === pageId) {
                return resolvePageDocument(page, ancestors);
            }

            const result = iteratePages(page.pages, [...ancestors, page]);
            if (result) {
                return result;
            }
        }
    };
    return iteratePages(rootPages, []);
}

/**
 * Resolve the next/previous page before another one.
 * It ignores hidden pages as this is used for navigation purpose.
 */
export function resolvePrevNextPages(
    rootPages: Revision['pages'],
    page: RevisionPageDocument
): { previous?: RevisionPageDocument; next?: RevisionPageDocument } {
    const flat = flattenPages(rootPages, (page) => !page.hidden);

    const currentIndex = flat.findIndex((p) => p.id === page.id);
    if (currentIndex === -1) {
        return {};
    }

    const previous = flat[currentIndex - 1];
    const next = flat[currentIndex + 1];

    return {
        previous,
        next,
    };
}

/**
 * Resolve a page to its canonical path. The first page of the site will return "".
 * The path will NOT start with "/".
 */
export function getPagePath(
    rootPages: Revision['pages'],
    page: RevisionPageDocument | RevisionPageGroup
): string {
    const firstPage = resolveFirstDocument(rootPages, []);

    if (firstPage && firstPage.page.id === page.id) {
        return '';
    }

    return page.path;
}

/**
 * Get all possible paths for a page.
 */
export function getPagePaths(
    rootPages: Revision['pages'],
    page: RevisionPageDocument | RevisionPageGroup
): string[] {
    const path = getPagePath(rootPages, page);
    if (path === page.path) {
        return [path];
    }
    return [path, page.path];
}

/**
 * Test if a page has at least one descendant.
 */
export function hasPageVisibleDescendant(page: RevisionPageGroup | RevisionPageDocument): boolean {
    return (
        page.pages.length > 0 &&
        page.pages.some(
            (child) =>
                (child.type === RevisionPageType.Link ||
                    child.type === RevisionPageType.Document) &&
                !child.hidden
        )
    );
}

/**
 * Resolve the first page document in a list of pages.
 */
export function resolveFirstDocument(
    pages: RevisionPage[],
    ancestors: AncestorRevisionPage[]
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    for (const page of pages) {
        if (page.type === 'link') {
            continue;
        }

        const result = resolvePageDocument(page, ancestors);
        if (result) {
            return result;
        }
    }

    return;
}

function resolvePageDocument(
    page: RevisionPage,
    ancestors: AncestorRevisionPage[]
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    if (page.type === RevisionPageType.Group) {
        const firstDocument = resolveFirstDocument(page.pages, [...ancestors, page]);
        if (firstDocument) {
            return firstDocument;
        }

        return;
    }
    if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
        return undefined;
    }

    return { page, ancestors };
}

/**
 * Flatten a list of pages into a list of page documents.
 */
function flattenPages(
    pages: RevisionPage[],
    filter?: (page: RevisionPageDocument | RevisionPageGroup) => boolean
): RevisionPageDocument[] {
    const result: RevisionPageDocument[] = [];
    for (const page of pages) {
        if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
            continue;
        }

        if (filter && !filter(page)) {
            continue;
        }

        if (page.type === RevisionPageType.Document) {
            result.push(page);
        }
        result.push(...flattenPages(page.pages, filter));
    }

    return result;
}

export async function getPagesTree(
    pages: FlatPageEntry[],
    options: {
        siteSpaceUrl: string;
        linker: GitBookLinker;
        heading?: string;
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
    if (options.heading) {
        nodes.push({
            type: 'heading',
            depth: 2,
            children: [{ type: 'text', value: options.heading }],
        });
    }
    nodes.push({
        type: 'list',
        spread: false,
        children: listChildren,
    });
    return nodes;
}
