import { ContentRef, Revision, RevisionFile, RevisionPageDocument, Space } from '@gitbook/api';
import assertNever from 'assert-never';
import React from 'react';

import { PageIcon } from '@/components/PageIcon';

import {
    ContentPointer,
    SiteContentPointer,
    getCollection,
    getDocument,
    getRevisionFile,
    getSpace,
    getSpaceContentData,
    getUserById,
    ignoreAPIError,
} from './api';
import { getBlockById, getBlockTitle } from './document';
import { gitbookAppHref, pageHref, PageHrefContext } from './links';
import { getPagePath, resolvePageId } from './pages';
import { ClassValue } from './tailwind';

export interface ResolvedContentRef {
    /** Text to render in the content ref */
    text: string;
    /** Additional sub text to render in the content ref */
    subText?: string;
    /** Icon associated with it */
    icon?: React.ReactNode;
    /** Emoji associated with the reference */
    emoji?: string;
    /** URL to open for the content ref */
    href: string;
    /** True if the content ref is active */
    active: boolean;
    /** File, if the reference is a file */
    file?: RevisionFile;
}

export interface ContentRefContext extends PageHrefContext {
    /**
     * Base URL to use to prepend to relative URLs.
     */
    baseUrl?: string;

    /**
     * Site in which we are resolving the content reference.
     */
    siteContext: SiteContentPointer;
    /**
     * Space in which we are resolving the content reference.
     */
    space: Space;

    /**
     * Revision in which we are resolving the content reference.
     */
    revisionId: string;

    /**
     * Pages in the revision.
     */
    pages: Revision['pages'];

    /**
     * Page in which the content reference is being resolved.
     */
    page?: RevisionPageDocument;
}

export interface ResolveContentRefOptions {
    /**
     * Should the content ref be rendered as text.
     * @default false
     */
    resolveAnchorText?: boolean;

    /**
     * Styles to apply to the icon.
     */
    iconStyle?: ClassValue;
}

/**
 * Resolve a content reference to be rendered.
 */
export async function resolveContentRef(
    contentRef: ContentRef,
    context: ContentRefContext,
    options: ResolveContentRefOptions = {},
): Promise<ResolvedContentRef | null> {
    const { resolveAnchorText = false, iconStyle } = options;
    const { siteContext, space, revisionId, pages, page: activePage, ...linksContext } = context;

    switch (contentRef.kind) {
        case 'url': {
            return {
                href: contentRef.url,
                text: contentRef.url,
                active: false,
            };
        }

        case 'file': {
            const file = await getRevisionFile(space.id, revisionId, contentRef.file);
            if (file) {
                return {
                    href: file.downloadURL,
                    text: file.name,
                    active: false,
                    file,
                };
            } else {
                return null;
            }
        }

        case 'anchor':
        case 'page': {
            if (contentRef.space && contentRef.space !== space.id) {
                return resolveContentRefInSpace(contentRef.space, siteContext, contentRef);
            }

            const resolvePageResult =
                !contentRef.page || contentRef.page === activePage?.id
                    ? activePage
                        ? { page: activePage, ancestors: [] }
                        : undefined
                    : resolvePageId(pages, contentRef.page);

            const page = resolvePageResult?.page;
            if (!page) {
                return null;
            }

            let anchor = contentRef.kind === 'page' ? undefined : contentRef.anchor;
            const isCurrentPage = page.id === activePage?.id;

            let href = '';
            let text = '';
            let icon: React.ReactNode | undefined = undefined;
            let emoji: string | undefined = undefined;

            // Compute the text to display for the link
            if (anchor) {
                text = '#' + anchor;

                if (resolveAnchorText) {
                    const document = page.documentId
                        ? await getDocument(space.id, page.documentId)
                        : null;
                    if (document) {
                        const block = getBlockById(document, anchor);
                        if (block) {
                            text = getBlockTitle(block);
                        }
                    }
                }
            } else {
                const parentPage = (resolvePageResult?.ancestors || []).slice(-1).pop();
                // When the looked up ref was a page group we use the page group title as resolved ref text.
                // Otherwise use the resolved page title.
                text =
                    parentPage && contentRef.page === parentPage.id && parentPage.type === 'group'
                        ? parentPage.title
                        : page.title;
                emoji = isCurrentPage ? undefined : page.emoji;
                icon = <PageIcon page={page} style={iconStyle} />;
            }

            // Compute the href for the link
            if (context.baseUrl) {
                // Page in another content
                href = new URL(getPagePath(pages, page), context.baseUrl).toString();

                if (anchor) {
                    href += '#' + anchor;
                }
            } else {
                // Page in the current content
                href = pageHref(pages, page, linksContext, anchor);
            }

            return {
                href,
                text,
                emoji,
                icon,
                active: !anchor && page.id === activePage?.id,
            };
        }

        case 'space': {
            const targetSpace =
                contentRef.space === space.id
                    ? space
                    : await ignoreAPIError(
                          getSpace(
                              contentRef.space,
                              siteContext?.siteShareKey ? siteContext.siteShareKey : undefined,
                          ),
                      );

            if (!targetSpace) {
                return {
                    href: gitbookAppHref(`/s/${contentRef.space}`),
                    text: 'space',
                    active: false,
                };
            }

            return {
                href: targetSpace.urls.published ?? targetSpace.urls.app,
                text: targetSpace.title,
                active: contentRef.space === space.id,
            };
        }

        case 'user': {
            const user = await getUserById(contentRef.user);
            if (user) {
                return {
                    href: `mailto:${user.email}`,
                    text: user.displayName ?? user.email,
                    active: false,
                };
            } else {
                return null;
            }
        }

        case 'snippet': {
            return {
                href: gitbookAppHref(`/o/${contentRef.organization}/snippet/${contentRef.snippet}`),
                text: 'snippet',
                active: false,
            };
        }

        case 'collection': {
            const collection = await ignoreAPIError(getCollection(contentRef.collection));
            if (!collection) {
                return {
                    href: gitbookAppHref(`/s/${contentRef.collection}`),
                    text: 'collection',
                    active: false,
                };
            }

            return {
                href: collection.urls.app,
                text: collection.title,
                active: false,
            };
        }

        case 'synced-block': {
            return null;
        }

        default:
            assertNever(contentRef);
    }
}

async function resolveContentRefInSpace(
    spaceId: string,
    siteContext: SiteContentPointer | null,
    contentRef: ContentRef,
) {
    const pointer: ContentPointer = {
        spaceId,
    };

    const result = await ignoreAPIError(getSpaceContentData(pointer, siteContext?.siteShareKey));
    if (!result) {
        return null;
    }

    const { space, pages } = result;

    // Base URL to use to prepend to relative URLs.
    let baseUrl = space.urls.published ?? space.urls.app;
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }

    const resolved = await resolveContentRef(contentRef, {
        siteContext,
        space,
        revisionId: space.revision,
        pages,
        baseUrl,
    });

    if (!resolved) {
        return null;
    }

    return {
        ...resolved,
        subText: space.title,
    };
}

export function resolveContentRefWithFiles(
    files: RevisionFile[],
    contentRef: ContentRef,
): ResolvedContentRef | null | undefined {
    if (contentRef.kind === 'file') {
        const file = files.find((file) => file.id === contentRef.file);
        if (file) {
            return {
                href: file.downloadURL,
                text: file.name,
                active: false,
                file,
            };
        }
        return null;
    }
    return undefined;
}
