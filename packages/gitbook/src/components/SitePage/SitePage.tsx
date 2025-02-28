import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import { getPageDocument } from '@v2/lib/data';
import type { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getPagePath, resolveFirstDocument } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';

import { PageClientLayout } from './PageClientLayout';
import { type PagePathParams, fetchPageData, getPathnameParam, normalizePathname } from './fetch';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export type SitePageProps = {
    context: GitBookSiteContext;
    pageParams: PagePathParams;
    redirectOnFallback: boolean;
    fallback?: boolean;
};

/**
 * Fetch and render a page.
 */
export async function SitePage(props: SitePageProps) {
    const { context, pageTarget } = await getPageDataWithFallback({
        context: props.context,
        pagePathParams: props.pageParams,
        fallback: props.fallback,
        redirectOnFallback: props.redirectOnFallback,
    });

    const rawPathname = getPathnameParam(props.pageParams);
    if (!pageTarget) {
        const pathname = normalizePathname(rawPathname);
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(context.linker.toPathInContent(pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(context.pages, pageTarget.page) !== rawPathname) {
        redirect(
            context.linker.toPathForPage({
                pages: context.pages,
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
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    const document = await getPageDocument(context.dataFetcher, context.space.id, page);

    return (
        <>
            {withFullPageCover && page.cover ? (
                <PageCover as="full" page={page} cover={page.cover} context={context} />
            ) : null}
            {/* We use a flex row reverse to render the aside first because the page is streamed. */}
            <div className="flex grow flex-row-reverse justify-end">
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
                />
            </div>
            <React.Suspense fallback={null}>
                <PageClientLayout withSections={withSections} />
            </React.Suspense>
        </>
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
        fallback: props.fallback,
    });

    if (!pageTarget) {
        notFound();
    }

    const { page, ancestors } = pageTarget;
    const { site, customization, pages, linker } = context;

    return {
        title: [page.title, site.title].filter(Boolean).join(' | '),
        description: page.description ?? '',
        alternates: {
            // Trim trailing slashes in canonical URL to match the redirect behavior
            canonical: linker
                .toAbsoluteURL(linker.toPathForPage({ pages, page }))
                .replace(/\/+$/, ''),
        },
        openGraph: {
            images: [
                customization.socialPreview.url ??
                    linker.toAbsoluteURL(linker.toPathInContent(`~gitbook/ogimage/${page.id}`)),
            ],
        },
        robots:
            (await isSiteIndexable(context)) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(args: {
    context: GitBookSiteContext;
    pagePathParams: PagePathParams;
    fallback?: boolean;
    redirectOnFallback?: boolean;
}) {
    const { context: baseContext, pagePathParams, fallback, redirectOnFallback = false } = args;

    let { context, pageTarget } = await fetchPageData(baseContext, pagePathParams);

    const canFallback = !!fallback;
    if (!pageTarget && canFallback) {
        const rootPage = resolveFirstDocument(context.pages, []);

        if (redirectOnFallback && rootPage?.page) {
            redirect(
                context.linker.toPathForPage({
                    pages: context.pages,
                    page: rootPage?.page,
                })
            );
        }

        pageTarget = rootPage;
    }

    return {
        context: {
            ...context,
            page: pageTarget?.page,
        },
        pageTarget,
    };
}
