import {
    type GitBookAnyContext,
    type GitBookSpaceContext,
    fetchSpaceContextByIds,
} from '@/lib/context';
import {
    getDataOrNull,
    getPageDocument,
    getRevisionFile,
    getRevisionReusableContent,
    ignoreDataThrownError,
} from '@/lib/data';
import {
    type GitBookLinker,
    createLinker,
    linkerWithAbsoluteURLs,
    linkerWithOtherSpaceBasePath,
} from '@/lib/links';
import type {
    ContentRef,
    RevisionFile,
    RevisionPageDocument,
    RevisionReusableContent,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { Filesystem } from '@gitbook/openapi-parser';
import assertNever from 'assert-never';
import type React from 'react';

import { PageIcon } from '@/components/PageIcon';

import { getGitBookAppHref } from './app';
import { getBlockById, getBlockTitle } from './document';
import { resolvePageId } from './pages';
import { findSiteSpaceBy, getFallbackSiteSpacePath } from './sites';
import type { ClassValue } from './tailwind';
import { filterOutNullable } from './typescript';

export interface ResolvedContentRef {
    /** Text to render in the content ref */
    text: string;
    /** Additional sub text to render in the content ref */
    subText?: string;
    /** Icon associated with it */
    icon?: React.ReactNode;
    /** Emoji associated with the reference */
    emoji?: string;
    /** The content ref's ancestors */
    ancestors?: { icon?: React.ReactNode; label: string; href?: string }[];
    /** URL to open for the content ref */
    href: string;
    /** True if the content ref is active */
    active: boolean;
    /** File, if the reference is a file */
    file?: RevisionFile;
    /** Page document resolved from the content ref */
    page?: RevisionPageDocument;
    /** Resolved reusable content, if the ref points to reusable content on a revision. Also contains the space and revision used for resolution. */
    reusableContent?: {
        context: GitBookSpaceContext;
        revisionReusableContent: RevisionReusableContent;
    };
    /** Resolve OpenAPI spec filesystem. */
    openAPIFilesystem?: Filesystem;
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
    context: GitBookAnyContext,
    options: ResolveContentRefOptions = {}
): Promise<ResolvedContentRef | null> {
    const { resolveAnchorText = false, iconStyle } = options;
    const { linker, dataFetcher, space, revision } = context;

    const activePage = 'page' in context ? context.page : undefined;

    switch (contentRef.kind) {
        case 'url': {
            return {
                href: contentRef.url,
                text: contentRef.url,
                active: false,
            };
        }

        case 'file': {
            const file = getRevisionFile({ revision, fileId: contentRef.file });
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

        case 'anchor':
        case 'page': {
            if (contentRef.space && contentRef.space !== space.id) {
                return resolveContentRefInSpace(contentRef.space, context, contentRef);
            }

            const resolvePageResult =
                !contentRef.page || contentRef.page === activePage?.id
                    ? activePage
                        ? { page: activePage, ancestors: [] }
                        : undefined
                    : resolvePageId(revision.pages, contentRef.page);

            const page = resolvePageResult?.page;
            const ancestors =
                resolvePageResult?.ancestors.map((ancestor) => ({
                    label: ancestor.title,
                    icon: <PageIcon page={ancestor} style={iconStyle} />,
                    href: linker.toPathForPage({ page: ancestor, pages: revision.pages }),
                })) ?? [];
            if (!page) {
                return null;
            }

            const anchor = contentRef.kind === 'page' ? undefined : contentRef.anchor;
            const isCurrentPage = page.id === activePage?.id;

            let text = '';
            let icon: React.ReactNode | undefined = undefined;
            let emoji: string | undefined = undefined;
            const href = linker.toPathForPage({ page, pages: revision.pages, anchor });

            // Compute the text to display for the link
            if (anchor) {
                text = page.title;
                ancestors.push({
                    label: page.title,
                    icon: <PageIcon page={page} style={iconStyle} />,
                    href,
                });

                if (resolveAnchorText) {
                    const document = await getPageDocument(context, page);
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

            return {
                href,
                text,
                subText: page.description,
                ancestors: ancestors,
                emoji,
                icon,
                page,
                active: !anchor && page.id === activePage?.id,
            };
        }

        case 'space': {
            const targetSpace =
                contentRef.space === context.space.id
                    ? {
                          space: context.space,
                          siteSpace: 'siteSpace' in context ? context.siteSpace : null,
                      }
                    : await getBestTargetSpace(context, contentRef.space);

            if (!targetSpace) {
                return {
                    href: getGitBookAppHref(`/s/${contentRef.space}`),
                    text: 'space',
                    active: false,
                };
            }

            return {
                href:
                    targetSpace.siteSpace?.urls.published ??
                    targetSpace.space.urls.published ??
                    targetSpace.space.urls.app,
                text: targetSpace.siteSpace?.title ?? targetSpace.space.title,
                active: contentRef.space === space.id,
            };
        }

        case 'user': {
            const user = await getDataOrNull(dataFetcher.getUserById(contentRef.user));
            if (user) {
                return {
                    href: `mailto:${user.email}`,
                    text: user.displayName ?? user.email,
                    active: false,
                };
            }
            return null;
        }

        case 'collection': {
            return {
                href: getGitBookAppHref('/home'),
                text: 'collection',
                active: false,
            };
        }

        case 'reusable-content': {
            // Figure out which space and revision the reusable content is in.
            const container = await (async () => {
                // without a space on the content ref, or if the space is the same as the current one, we can use the current revision.
                if (!contentRef.space || contentRef.space === context.space.id) {
                    return context;
                }

                // References inside reusable content from a different space need to resolve in the parent space.
                // Create a context and a linker that ensures links are resolved with the correct parent, and are kept absolute.
                const ctx = await createContextForSpace(contentRef.space, context);
                if (!ctx) {
                    return null;
                }

                return ctx.spaceContext;
            })();

            if (!container) {
                return null;
            }

            const reusableContent = getRevisionReusableContent({
                revision: container.revision,
                reusableContentId: contentRef.reusableContent,
            });

            if (!reusableContent) {
                return null;
            }

            return {
                href: getGitBookAppHref(
                    `/s/${container.space.id}/~/reusable/${reusableContent.id}`
                ),
                text: reusableContent.title,
                active: false,
                reusableContent: {
                    context: container,
                    revisionReusableContent: reusableContent,
                },
            };
        }

        case 'openapi': {
            const openAPISpecVersionContent = await getDataOrNull(
                dataFetcher.getLatestOpenAPISpecVersionContent({
                    organizationId: context.organizationId,
                    slug: contentRef.spec,
                })
            );

            if (!openAPISpecVersionContent) {
                return null;
            }
            return {
                href: openAPISpecVersionContent.url,
                text: contentRef.spec,
                active: false,
                openAPIFilesystem: openAPISpecVersionContent.filesystem as Filesystem,
            };
        }

        default:
            assertNever(contentRef);
    }
}

/**
 * This function is used to get the best possible target space while resolving a content ref.
 * It will try to return the space in the site context if it exists to avoid cross-site links.
 */
async function getBestTargetSpace(
    context: GitBookAnyContext,
    spaceId: string
): Promise<{ space: Space; siteSpace: SiteSpace | null } | undefined> {
    const { dataFetcher } = context;

    // In the context of sites, we try to find our target space in the site structure.
    // because the url of this space will be in the same site.
    if ('site' in context) {
        const found = findSiteSpaceBy(
            context.structure,
            (siteSpace) => siteSpace.space.id === spaceId
        );
        if (found) {
            return { space: found.siteSpace.space, siteSpace: found.siteSpace };
        }
    }

    const fetchedSpace = await getDataOrNull(
        dataFetcher.getSpace({
            spaceId,
            shareKey: context?.shareKey,
        }),
        [404, 403]
    );

    // Else we try return the fetched space from the API.
    return fetchedSpace ? { space: fetchedSpace, siteSpace: null } : undefined;
}

async function resolveContentRefInSpace(
    spaceId: string,
    context: GitBookAnyContext,
    contentRef: ContentRef
) {
    const ctx = await createContextForSpace(spaceId, context);

    if (!ctx) {
        return null;
    }

    const resolved = await resolveContentRef(contentRef, ctx.spaceContext);

    if (!resolved) {
        return null;
    }

    return {
        ...resolved,
        ancestors: [
            {
                label: ctx.spaceContext.space.title,
                href: ctx.baseURL.toString(),
            },
            ...(resolved.ancestors ?? []),
        ].filter(filterOutNullable),
    };
}

/**
 * Create a new context for a specific spaceId.
 *
 * As the resolved space may not be the same as the given spaceId, this function also
 * returns the new space context and the base URL used for the linker.
 */
async function createContextForSpace(
    spaceId: string,
    context: GitBookAnyContext
): Promise<{
    spaceContext: GitBookSpaceContext;
    baseURL: URL;
} | null> {
    const [spaceContext, bestTargetSpace] = await Promise.all([
        ignoreDataThrownError(
            fetchSpaceContextByIds(context, {
                space: spaceId,
                shareKey: context?.shareKey,
                changeRequest: undefined,
                revision: undefined,
            })
        ),
        getBestTargetSpace(context, spaceId),
    ]);
    if (!spaceContext) {
        return null;
    }

    const space = bestTargetSpace?.space ?? spaceContext.space;

    let linker: GitBookLinker;

    // Resolve URLs relative to the space.
    const baseURL = new URL(
        bestTargetSpace?.siteSpace?.urls.published ?? space.urls.published ?? space.urls.app
    );

    if (bestTargetSpace?.siteSpace && 'site' in context) {
        // If we found the space ID in the current site context, we can resolve links relative to it in the site.
        linker = linkerWithOtherSpaceBasePath(context.linker, {
            spaceBasePath: getFallbackSiteSpacePath(context, bestTargetSpace.siteSpace),
        });
    } else {
        // Otherwise we generate absolute URLs as we are pointing to a different site.
        linker = linkerWithAbsoluteURLs(
            createLinker({
                host: baseURL.host,
                spaceBasePath: baseURL.pathname,
                siteBasePath: baseURL.pathname,
            })
        );
    }

    return {
        spaceContext: {
            ...spaceContext,
            linker,
        },
        baseURL,
    };
}
