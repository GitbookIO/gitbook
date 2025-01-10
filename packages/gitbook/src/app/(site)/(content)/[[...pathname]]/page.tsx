import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getGitBookContextFromHeaders, GitBookContext } from '@/lib/gitbook-context';
import { PageHrefContext, getAbsoluteHref, getPageHref } from '@/lib/links';
import { getPagePath, resolveFirstDocument } from '@/lib/pages';
import { ContentRefContext } from '@/lib/references';
import { isSpaceIndexable, isPageIndexable } from '@/lib/seo';
import { getContentTitle } from '@/lib/utils';

import { PageClientLayout } from './PageClientLayout';
import { PagePathParams, fetchPageData, getPathnameParam, normalizePathname } from '../../fetch';

export const runtime = 'edge';

type Props = {
    params: Promise<PagePathParams>;
    searchParams: Promise<{ fallback?: string }>;
};

/**
 * Fetch and render a page.
 */
export default async function Page(props: Props) {
    const [headersList, params, searchParams] = await Promise.all([
        headers(),
        props.params,
        props.searchParams,
    ]);
    const ctx = getGitBookContextFromHeaders(headersList);

    const {
        content: contentPointer,
        contentTarget,
        sections,
        space,
        site,
        customization,
        pages,
        page,
        ancestors,
        document,
    } = await getPageDataWithFallback(ctx, {
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
            redirect(getAbsoluteHref(ctx, pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(pages, page) !== rawPathname) {
        redirect(getPageHref(ctx, pages, page, linksContext));
    }

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withFullPageCover = !!(
        page.cover &&
        page.layout.cover &&
        page.layout.coverSize === 'full'
    );
    const withPageFeedback = customization.feedback.enabled;

    const contentRefContext: ContentRefContext = {
        siteContext: contentPointer,
        space,
        revisionId: contentTarget.revisionId,
        pages,
        page,
    };

    const withSections = Boolean(sections && sections.list.length > 0);
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    return (
        <>
            {withFullPageCover && page.cover ? (
                <PageCover as="full" page={page} cover={page.cover} context={contentRefContext} />
            ) : null}
            {/* We use a flex row reverse to render the aside first because the page is streamed. */}
            <div className="flex flex-row-reverse justify-end">
                {page.layout.outline ? (
                    <PageAside
                        space={space}
                        site={site}
                        customization={customization}
                        page={page}
                        document={document}
                        withHeaderOffset={headerOffset}
                        withFullPageCover={withFullPageCover}
                        withPageFeedback={withPageFeedback}
                        context={contentRefContext}
                    />
                ) : null}
                <PageBody
                    space={space}
                    pointer={contentPointer}
                    contentTarget={contentTarget}
                    customization={customization}
                    context={contentRefContext}
                    page={page}
                    ancestors={ancestors}
                    document={document}
                    withPageFeedback={
                        // Display the page feedback in the page footer if the aside is not visible
                        withPageFeedback && !page.layout.outline
                    }
                />
            </div>
            <React.Suspense fallback={null}>
                <PageClientLayout withSections={withSections} />
            </React.Suspense>
        </>
    );
}

export async function generateViewport(props: Props): Promise<Viewport> {
    const [params, headersList] = await Promise.all([props.params, headers()]);
    const ctx = getGitBookContextFromHeaders(headersList);
    const { customization } = await fetchPageData(ctx, params);
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const [params, searchParams, headersList] = await Promise.all([
        props.params,
        props.searchParams,
        headers(),
    ]);
    const ctx = getGitBookContextFromHeaders(headersList);
    const { space, pages, page, customization, site, ancestors } = await getPageDataWithFallback(
        ctx,
        {
            pagePathParams: params,
            searchParams: searchParams,
        },
    );

    if (!page) {
        notFound();
    }

    return {
        title: [page.title, getContentTitle(space, customization, site ?? null)]
            .filter(Boolean)
            .join(' | '),
        description: page.description ?? '',
        alternates: {
            // Trim trailing slashes in canonical URL to match the redirect behavior
            canonical: getAbsoluteHref(ctx, getPagePath(pages, page), true).replace(/\/+$/, ''),
        },
        openGraph: {
            images: [
                customization.socialPreview.url ??
                    getAbsoluteHref(ctx, `~gitbook/ogimage/${page.id}`, true),
            ],
        },
        robots:
            isSpaceIndexable(ctx, { space, site: site ?? null }) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(
    ctx: GitBookContext,
    args: {
        pagePathParams: PagePathParams;
        searchParams: { fallback?: string };
        redirectOnFallback?: boolean;
    },
) {
    const { pagePathParams, searchParams, redirectOnFallback = false } = args;

    const { pages, page: targetPage, ...otherPageData } = await fetchPageData(ctx, pagePathParams);

    let page = targetPage;
    const canFallback = !!searchParams.fallback;
    if (!page && canFallback) {
        const rootPage = resolveFirstDocument(pages, []);

        if (redirectOnFallback && rootPage?.page) {
            redirect(getPageHref(ctx, pages, rootPage?.page));
        }

        page = rootPage?.page;
    }

    return {
        ...otherPageData,
        pages,
        page,
    };
}
