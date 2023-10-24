import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { resolvePageId } from './pages';
import { pageHref } from './links';

export interface ResolvedContentRef {
    /** Text to render in the content ref */
    text: string;
    /** URL to open for the content ref */
    href: string;
}

export interface ContentRefContext {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
}

/**
 * Resolve a content reference to be rendered.
 */
export async function resolveContentRef(
    contentRef: any,
    { space, revision, page: activePage }: ContentRefContext,
): Promise<ResolvedContentRef | null> {
    // Try to resolve a local ref in the current space
    if (contentRef.kind === 'url') {
        return {
            href: contentRef.url,
            text: contentRef.url,
        };
    } else if (contentRef.kind === 'file') {
        const file = revision.files.find((file) => file.id === contentRef.file);
        if (file) {
            return {
                href: file.downloadURL,
                text: file.name,
            };
        } else {
            return null;
        }
    } else if ((contentRef.kind === 'page' || contentRef.kind === 'anchor') && !contentRef.space) {
        const page =
            contentRef.page && contentRef.page !== activePage.id
                ? activePage
                : resolvePageId(revision, contentRef.page)?.page;
        if (!page) {
            return null;
        }

        if (contentRef.kind === 'page') {
            return {
                href: pageHref(page.path),
                text: page.title,
            };
        }

        return {
            href: pageHref(page.path) + '#' + contentRef.anchor,
            text: page.title + '#' + contentRef.anchor,
        };
    } else if (contentRef.kind === 'space' && contentRef.space === space.id) {
        return {
            href: space.urls.published ?? space.urls.app,
            text: space.title,
        };
    }

    // Other use the API to resolve
    // TODO
    return null;
}
