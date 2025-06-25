import type {
    ContentRef,
    Revision,
    RevisionFile,
    RevisionPageDocument,
    RevisionReusableContent,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { Filesystem } from '@gitbook/openapi-parser';
import {
    type GitBookAnyContext,
    type GitBookSpaceContext,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import {
    getDataOrNull,
    getPageDocument,
    getRevisionFile,
    getRevisionReusableContent,
    ignoreDataThrownError,
} from '@v2/lib/data';
import { type GitBookLinker, createLinker } from '@v2/lib/links';
import assertNever from 'assert-never';
import type React from 'react';

import { PageIcon } from '@/components/PageIcon';

import { getGitBookAppHref } from './app';
import { getBlockById, getBlockTitle } from './document';
import { resolvePageId } from './pages';
import { findSiteSpaceById } from './sites';
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
        revisionReusableContent: RevisionReusableContent;
        space: Space;
        revision: Revision;
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

            // console.log(`resolve`, contentRef);
            // console.log(`context`, context);
            const resolvePageResult =
                !contentRef.page || contentRef.page === activePage?.id
                    ? activePage
                        ? { page: activePage, ancestors: [] }
                        : undefined
                    : resolvePageId(revision.pages, contentRef.page);

            // console.log(`resolvePageResult`, resolvePageResult);

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

                const otherContext = await ignoreDataThrownError(
                    fetchSpaceContextByIds(context, {
                        space: contentRef.space,
                        shareKey: undefined,
                        changeRequest: undefined,
                        revision: undefined,
                    })
                );

                if (!otherContext) {
                    return null;
                }

                return otherContext;
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
                    revisionReusableContent: reusableContent,
                    space: container.space,
                    revision: container.revision,
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

    const [fetchedSpace, publishedContentSite] = await Promise.all([
        getDataOrNull(
            dataFetcher.getSpace({
                spaceId,
                shareKey: context?.shareKey,
            }),
            [404, 403]
        ),
        'site' in context
            ? getDataOrNull(
                  dataFetcher.getPublishedContentSite({
                      organizationId: context.organizationId,
                      siteId: context.site.id,
                      siteShareKey: context.shareKey,
                  }),
                  [404, 403]
              )
            : null,
    ]);

    // In the context of sites, we try to find our target space in the site structure.
    // because the url of this space will be in the same site.
    if (publishedContentSite) {
        const siteSpace = findSiteSpaceById(publishedContentSite.structure, spaceId);
        if (siteSpace) {
            return { space: siteSpace.space, siteSpace };
        }
    }

    // Else we try return the fetched space from the API.
    return fetchedSpace ? { space: fetchedSpace, siteSpace: null } : undefined;
}

async function resolveContentRefInSpace(
    spaceId: string,
    context: GitBookAnyContext,
    contentRef: ContentRef
) {
    const ctx = await createLinkerForSpace(spaceId, context);

    if (!ctx) {
        return null;
    }

    const resolved = await resolveContentRef(contentRef, {
        ...ctx.spaceContext,
        space: ctx.space,
        linker: ctx.linker,
    });

    if (!resolved) {
        return null;
    }

    return {
        ...resolved,
        ancestors: [
            {
                label: ctx.space.title,
                href: ctx.baseURL.toString(),
            },
            ...(resolved.ancestors ?? []),
        ].filter(filterOutNullable),
    };
}

export async function createLinkerForSpace(
    spaceId: string,
    context: GitBookAnyContext
): Promise<{
    spaceContext: GitBookSpaceContext;
    linker: GitBookLinker;
    space: Space;
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

    // Resolve URLs relative to the space.
    const baseURL = new URL(
        bestTargetSpace?.siteSpace?.urls.published ?? space.urls.published ?? space.urls.app
    );
    const linker = createLinker(
        {
            host: baseURL.host,
            spaceBasePath: baseURL.pathname,
            siteBasePath: baseURL.pathname,
        },
        // Resolve pages as absolute URLs as we are in a different site.
        { alwaysAbsolute: true }
    );

    return {
        spaceContext,
        linker,
        space,
        baseURL,
    };
}
