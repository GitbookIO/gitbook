import { ContentRef, Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { resolvePageId } from './pages';
import { pageHref, PageHrefContext } from './links';

export interface ResolvedContentRef {
    /** Text to render in the content ref */
    text: string;
    /** URL to open for the content ref */
    href: string;
    /** True if the content ref is active */
    active: boolean;
}

export interface ContentRefContext extends PageHrefContext {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
}

/**
 * Resolve a content reference to be rendered.
 */
export async function resolveContentRef(
    contentRef: ContentRef,
    { space, revision, page: activePage, ...linksContext }: ContentRefContext,
): Promise<ResolvedContentRef | null> {
    // Try to resolve a local ref in the current space
    if (contentRef.kind === 'url') {
        return {
            href: contentRef.url,
            text: contentRef.url,
            active: false,
        };
    } else if (contentRef.kind === 'file') {
        const file = revision.files.find((file) => file.id === contentRef.file);
        if (file) {
            return {
                href: file.downloadURL,
                text: file.name,
                active: false,
            };
        } else {
            return null;
        }
    } else if (
        (contentRef.kind === 'page' || contentRef.kind === 'anchor') &&
        (contentRef.space ?? space.id) === space.id
    ) {
        const page =
            !contentRef.page || contentRef.page === activePage.id
                ? activePage
                : resolvePageId(revision, contentRef.page)?.page;
        if (!page) {
            return null;
        }

        if (contentRef.kind === 'page') {
            return {
                href: pageHref(page, linksContext),
                text: page.title,
                active: page.id === activePage.id,
            };
        }

        return {
            href: pageHref(page, linksContext, contentRef.anchor),
            text: page.title + '#' + contentRef.anchor,
            active: false,
        };
    } else if (contentRef.kind === 'space' && contentRef.space === space.id) {
        return {
            href: space.urls.published ?? space.urls.app,
            text: space.title,
            active: true,
        };
    }

    // Other use the API to resolve
    // TODO
    return null;
}
