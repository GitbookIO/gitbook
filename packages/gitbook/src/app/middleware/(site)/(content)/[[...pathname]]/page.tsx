import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import { getPageDocument } from '@v2/lib/data';
import { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getAbsoluteHref } from '@/lib/links';
import { getPagePath, resolveFirstDocument } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';

import { PageClientLayout } from './PageClientLayout';
import { PagePathParams, fetchPageData, getPathnameParam, normalizePathname } from '../../fetch';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Fetch and render a page.
 */
export default async function Page(props: {
    params: Promise<PagePathParams>;
    searchParams: Promise<{ fallback?: string }>;
}) {
    const { params: rawParams, searchParams: rawSearchParams } = props;

    const params = await rawParams;
    const searchParams = await rawSearchParams;

    const { context, pageTarget } = await getPageDataWithFallback({
        pagePathParams: params,
        searchParams,
        redirectOnFallback: true,
    });

    const rawPathname = getPathnameParam(params);
    if (!pageTarget) {
        const pathname = normalizePathname(rawPathname);
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(context.linker.toAbsoluteURL(pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(context.pages, pageTarget.page) !== rawPathname) {
        redirect(
            context.linker.toPathForPage({
                pages: context.pages,
                page: pageTarget.page,
            }),
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
            <div className="flex flex-row-reverse justify-end grow">
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

export async function generateViewport({
    params,
}: {
    params: Promise<PagePathParams>;
}): Promise<Viewport> {
    const { context } = await fetchPageData(await params);
    const { customization } = context;

    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<PagePathParams>;
    searchParams: Promise<{ fallback?: string }>;
}): Promise<Metadata> {
    const { context, pageTarget } = await getPageDataWithFallback({
        pagePathParams: await params,
        searchParams: await searchParams,
    });

    if (!pageTarget) {
        notFound();
    }

    const { page, ancestors } = pageTarget;
    const { site, customization, pages } = context;

    return {
        title: [page.title, site.title].filter(Boolean).join(' | '),
        description: page.description ?? '',
        alternates: {
            // Trim trailing slashes in canonical URL to match the redirect behavior
            canonical: (await getAbsoluteHref(getPagePath(pages, page), true)).replace(/\/+$/, ''),
        },
        openGraph: {
            images: [
                customization.socialPreview.url ??
                    (await getAbsoluteHref(`~gitbook/ogimage/${page.id}`, true)),
            ],
        },
        robots:
            (await isSiteIndexable(site)) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(args: {
    pagePathParams: PagePathParams;
    searchParams: { fallback?: string };
    redirectOnFallback?: boolean;
}) {
    const { pagePathParams, searchParams, redirectOnFallback = false } = args;

    let { context, pageTarget } = await fetchPageData(pagePathParams);

    const canFallback = !!searchParams.fallback;
    if (!pageTarget && canFallback) {
        const rootPage = resolveFirstDocument(context.pages, []);

        if (redirectOnFallback && rootPage?.page) {
            redirect(
                context.linker.toPathForPage({
                    pages: context.pages,
                    page: rootPage?.page,
                }),
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
