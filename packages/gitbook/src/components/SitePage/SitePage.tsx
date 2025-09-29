import type { GitBookSiteContext } from '@/lib/context';
import { getPageDocument } from '@/lib/data';
import {
    CustomizationHeaderPreset,
    CustomizationThemeMode,
    SiteInsightsDisplayContext,
} from '@gitbook/api';
import type { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getPagePath } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';

import { getResizedImageURL } from '@/lib/images';
import { tcls } from '@/lib/tailwind';
import { PageContextProvider } from '../PageContext';
import { PageClientLayout } from './PageClientLayout';
import { type PagePathParams, fetchPageData, getPathnameParam } from './fetch';

export type SitePageProps = {
    context: GitBookSiteContext;
    pageParams: PagePathParams;
};

/**
 * Fetch and render a page.
 */
export async function SitePage(props: SitePageProps) {
    const {
        context,
        page,
        ancestors,
        document,
        withFullPageCover,
        withPageFeedback,
        withSections,
        withTopHeader,
    } = await getSitePageData(props);
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    return (
        <PageContextProvider pageId={page.id} spaceId={context.space.id} title={page.title}>
            {/* Using `contents` makes the children of this div according to its parent — which keeps them in a single flex row with the TOC by default.
            If there's a page cover, we use `flex flex-col` to lay out the PageCover above the PageBody + PageAside instead. */}
            <div className={withFullPageCover && page.cover ? 'flex grow flex-col' : 'contents'}>
                {withFullPageCover && page.cover ? (
                    <PageCover as="full" page={page} cover={page.cover} context={context} />
                ) : null}

                <div
                    className={tcls(
                        withFullPageCover && page.cover ? 'flex grow flex-row' : 'contents',
                        withSections
                            ? '[--content-scroll-margin:calc(var(--spacing)*27)]'
                            : '[--content-scroll-margin:calc(var(--spacing)*16)]'
                    )}
                >
                    <PageAside
                        page={page}
                        document={document}
                        withHeaderOffset={headerOffset}
                        withFullPageCover={withFullPageCover}
                        withPageFeedback={withPageFeedback}
                        context={context}
                    />
                    <PageBody
                        context={context}
                        page={page}
                        ancestors={ancestors}
                        document={document}
                        withPageFeedback={withPageFeedback}
                        insightsDisplayContext={SiteInsightsDisplayContext.Site}
                    />
                </div>
                <React.Suspense fallback={null}>
                    <PageClientLayout />
                </React.Suspense>
            </div>
        </PageContextProvider>
    );
}

export async function generateSitePageViewport(context: GitBookSiteContext): Promise<Viewport> {
    const { customization } = context;

    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateSitePageMetadata(props: SitePageProps): Promise<Metadata> {
    const { context, pageTarget } = await getPageDataWithFallback({
        context: props.context,
        pagePathParams: props.pageParams,
    });

    if (!pageTarget) {
        notFound();
    }

    const { page, ancestors } = pageTarget;
    const { site, customization, revision, linker, imageResizer } = context;

    return {
        title: [page.title, site.title].filter(Boolean).join(' | '),
        description: page.description ?? '',
        alternates: {
            // Trim trailing slashes in canonical URL to match the redirect behavior
            canonical: linker
                .toAbsoluteURL(linker.toPathForPage({ pages: revision.pages, page }))
                .replace(/\/+$/, ''),
            types: {
                'text/markdown': `${linker.toAbsoluteURL(linker.toPathInSpace(page.path))}.md`,
            },
        },
        openGraph: {
            images: [
                customization.socialPreview.url
                    ? await getResizedImageURL(imageResizer, customization.socialPreview.url, {
                          width: 1200,
                          height: 630,
                      })
                    : linker.toAbsoluteURL(linker.toPathInSpace(`~gitbook/ogimage/${page.id}`)),
            ],
        },
        robots:
            (await isSiteIndexable(context)) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Fetches all the data required to render the site page.
 */
export async function getSitePageData(props: SitePageProps) {
    const { context, pageTarget } = await getPageDataWithFallback({
        context: props.context,
        pagePathParams: props.pageParams,
    });

    const rawPathname = getPathnameParam(props.pageParams);
    if (!pageTarget) {
        const pathname = rawPathname.toLowerCase();
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(context.linker.toPathInSpace(pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(context.revision.pages, pageTarget.page) !== rawPathname) {
        redirect(
            context.linker.toPathForPage({
                pages: context.revision.pages,
                page: pageTarget.page,
            })
        );
    }

    const { customization, sections } = context;
    const { page, ancestors } = pageTarget;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withFullPageCover = !!(
        page.cover &&
        page.layout.cover &&
        page.layout.coverSize === 'full'
    );
    const withPageFeedback = customization.feedback.enabled;

    const withSections = Boolean(sections && sections.list.length > 0);

    const document = await getPageDocument(context, page);

    return {
        context,
        page,
        ancestors,
        document,
        withSections,
        withPageFeedback,
        withFullPageCover,
        withTopHeader,
    };
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(args: {
    context: GitBookSiteContext;
    pagePathParams: PagePathParams;
}) {
    const { context: baseContext, pagePathParams } = args;
    const { context, pageTarget } = await fetchPageData(baseContext, pagePathParams);

    return {
        context: {
            ...context,
            page: pageTarget?.page,
        },
        pageTarget,
    };
}
