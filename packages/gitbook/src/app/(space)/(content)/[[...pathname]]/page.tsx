import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { PageHrefContext, absoluteHref, pageHref } from '@/lib/links';
import { getPagePath, isPageIndexable, resolveFirstDocument } from '@/lib/pages';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { getContentTitle } from '@/lib/utils';

import { PageClientLayout } from './PageClientLayout';
import { PagePathParams, fetchPageData, getPathnameParam, normalizePathname } from '../../fetch';

export const runtime = 'edge';

/**
 * Fetch and render a page.
 */
export default async function Page(props: {
    params: PagePathParams;
    searchParams: { fallback?: string };
}) {
    const { params, searchParams } = props;

    const {
        content: contentPointer,
        contentTarget,
        space,
        parent,
        customization,
        pages,
        page,
        document,
    } = await getPageDataWithFallback({
        pagePathParams: params,
        searchParams,
        redirectOnFallback: true,
    });

    const linksContext: PageHrefContext = {};
    const rawPathname = getPathnameParam(params);
    if (!page) {
        const pathname = normalizePathname(rawPathname);
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(absoluteHref(pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(pages, page) !== rawPathname) {
        redirect(pageHref(pages, page, linksContext));
    }

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withFullPageCover = !!(
        page.cover &&
        page.layout.cover &&
        page.layout.coverSize === 'full'
    );
    const withPageFeedback = customization.feedback.enabled;

    const contentRefContext: ContentRefContext = {
        siteContext: 'siteId' in contentPointer ? contentPointer : null,
        space,
        revisionId: contentTarget.revisionId,
        pages,
        page,
    };

    return (
        <>
            {withFullPageCover && page.cover ? (
                <PageCover as="full" page={page} cover={page.cover} context={contentRefContext} />
            ) : null}
            <div className={tcls('flex', 'flex-row')}>
                <PageBody
                    space={space}
                    contentPointer={contentPointer}
                    contentTarget={contentTarget}
                    customization={customization}
                    context={contentRefContext}
                    page={page}
                    document={document}
                    withPageFeedback={
                        // Display the page feedback in the page footer if the aside is not visible
                        withPageFeedback && !page.layout.outline
                    }
                />
                {page.layout.outline ? (
                    <PageAside
                        space={space}
                        site={parent?.object === 'site' ? parent : undefined}
                        customization={customization}
                        page={page}
                        document={document}
                        withHeaderOffset={withTopHeader}
                        withFullPageCover={withFullPageCover}
                        withPageFeedback={withPageFeedback}
                        context={contentRefContext}
                    />
                ) : null}
            </div>
            <React.Suspense fallback={null}>
                <PageClientLayout />
            </React.Suspense>
        </>
    );
}

export async function generateViewport({ params }: { params: PagePathParams }): Promise<Viewport> {
    const { customization } = await fetchPageData(params);
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
    params: PagePathParams;
    searchParams: { fallback?: string };
}): Promise<Metadata> {
    const { space, pages, page, customization, parent, ancestors } = await getPageDataWithFallback({
        pagePathParams: params,
        searchParams,
    });

    if (!page) {
        notFound();
    }

    const isIndexable = isPageIndexable(page) && ancestors.every(isPageIndexable);

    return {
        title: [page.title, getContentTitle(space, customization, parent)]
            .filter(Boolean)
            .join(' | '),
        description: page.description ?? '',
        alternates: {
            canonical: absoluteHref(getPagePath(pages, page), true),
        },
        openGraph: {
            images: [
                customization.socialPreview.url ??
                    absoluteHref(`~gitbook/ogimage/${page.id}`, true),
            ],
        },
        robots: isIndexable ? undefined : 'noindex',
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

    const { pages, page: targetPage, ...otherPageData } = await fetchPageData(pagePathParams);

    let page = targetPage;
    const canFallback = !!searchParams.fallback;
    if (!page && canFallback) {
        const rootPage = resolveFirstDocument(pages, []);

        if (redirectOnFallback && rootPage?.page) {
            redirect(pageHref(pages, rootPage?.page));
        }

        page = rootPage?.page;
    }

    return {
        ...otherPageData,
        pages,
        page,
    };
}
