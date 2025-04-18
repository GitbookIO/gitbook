import type {
    ContentRef,
    RevisionFile,
    RevisionPageDocument,
    RevisionReusableContent,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { Filesystem } from '@gitbook/openapi-parser';
import { type GitBookAnyContext, fetchSpaceContextByIds } from '@v2/lib/context';
import { getDataOrNull, getPageDocument, ignoreDataThrownError } from '@v2/lib/data';
import { createLinker } from '@v2/lib/links';
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
    /** Resolved reusable content, if the ref points to reusable content on a revision. */
    reusableContent?: RevisionReusableContent;
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

    /**
     * Resolve the content URL as absolute.
     * @default false
     */
    resolveAsAbsoluteURL?: boolean;
}

/**
 * Resolve a content reference to be rendered.
 */
export async function resolveContentRef(
    contentRef: ContentRef,
    context: GitBookAnyContext,
    options: ResolveContentRefOptions = {}
): Promise<ResolvedContentRef | null> {
    const { resolveAnchorText = false, resolveAsAbsoluteURL = false, iconStyle } = options;
    const { linker, dataFetcher, space, revisionId, pages } = context;

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
            const file = await getDataOrNull(
                dataFetcher.getRevisionFile({
                    spaceId: space.id,
                    revisionId,
                    fileId: contentRef.file,
                })
            );
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
                    : resolvePageId(pages, contentRef.page);

            const page = resolvePageResult?.page;
            const ancestors =
                resolvePageResult?.ancestors.map((ancestor) => ({
                    label: ancestor.title,
                    icon: <PageIcon page={ancestor} style={iconStyle} />,
                    href: resolveAsAbsoluteURL
                        ? linker.toAbsoluteURL(linker.toPathForPage({ page: ancestor, pages }))
                        : linker.toPathForPage({ page: ancestor, pages }),
                })) ?? [];
            if (!page) {
                return null;
            }

            const anchor = contentRef.kind === 'page' ? undefined : contentRef.anchor;
            const isCurrentPage = page.id === activePage?.id;

            let text = '';
            let icon: React.ReactNode | undefined = undefined;
            let emoji: string | undefined = undefined;
            const href = linker.toPathForPage({ page, pages, anchor });

            // Compute the text to display for the link
            if (anchor) {
                text = `#${anchor}`;
                ancestors.push({
                    label: page.title,
                    icon: <PageIcon page={page} style={iconStyle} />,
                    href: resolveAsAbsoluteURL ? linker.toAbsoluteURL(href) : href,
                });

                if (resolveAnchorText) {
                    const document = await getPageDocument(dataFetcher, space, page);
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
                href: resolveAsAbsoluteURL ? linker.toAbsoluteURL(href) : href,
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
            const reusableContent = await getDataOrNull(
                dataFetcher.getReusableContent({
                    spaceId: space.id,
                    revisionId,
                    reusableContentId: contentRef.reusableContent,
                })
            );
            if (!reusableContent) {
                return null;
            }
            return {
                href: getGitBookAppHref(`/s/${space.id}`),
                text: reusableContent.title,
                active: false,
                reusableContent,
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
    const linker = createLinker({
        host: baseURL.host,
        spaceBasePath: baseURL.pathname,
        siteBasePath: baseURL.pathname,
    });

    const resolved = await resolveContentRef(
        contentRef,
        {
            ...spaceContext,
            space,
            linker,
        },
        {
            // Resolve pages as absolute URLs as we are in a different site.
            resolveAsAbsoluteURL: true,
        }
    );

    if (!resolved) {
        return null;
    }

    return {
        ...resolved,
        ancestors: [
            {
                label: space.title,
                href: baseURL.toString(),
            },
            ...(resolved.ancestors ?? []),
        ].filter(filterOutNullable),
    };
}
