import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import React, { Suspense } from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { SkeletonHeading, SkeletonParagraph } from '@/components/primitives';
import { PageHrefContext, absoluteHref, pageHref } from '@/lib/links';
import { getPagePath, resolveFirstDocument } from '@/lib/pages';
import { ContentRefContext } from '@/lib/references';
import { isSpaceIndexable, isPageIndexable } from '@/lib/seo';
import { tcls } from '@/lib/tailwind';
import { getContentTitle } from '@/lib/utils';

import { PageClientLayout } from './PageClientLayout';
import { PagePathParams, fetchPageData, getPathnameParam, normalizePathname } from '../../fetch';

export const runtime = 'edge';

type PageProps = {
    params: PagePathParams;
    searchParams: { fallback?: string };
};

export default async function Page(props: PageProps) {
    // We wrap the page in Suspense to enable streaming at page level
    // it's only enabled in "navigation" mode
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent {...props} />
        </Suspense>
    );
}

async function PageContent(props: PageProps) {
    const data = await getPageDataWithFallback(props, { redirectOnFallback: true });
    const {
        content: contentPointer,
        contentTarget,
        sections,
        space,
        site,
        customization,
        pages,
        page,
        document,
    } = data;

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
            {/* Title is displayed by the browser, except in navigation mode */}
            <title>{getTitle(data)}</title>
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

function PageSkeleton() {
    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'flex-1',
                'relative',
                'py-8',
                'lg:px-16',
                'xl:mr-56',
                'items-center',
                'lg:items-start',
            )}
        >
            <div className={tcls('flex-1', 'max-w-3xl', 'mx-auto', 'page-full-width:mx-0')}>
                <SkeletonHeading style={tcls('mb-8')} />
                <SkeletonParagraph style={tcls('mb-4')} />
            </div>
        </div>
    );
}

export async function generateViewport({ params }: PageProps): Promise<Viewport> {
    const { customization } = await fetchPageData(params);
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

function getTitle(input: Awaited<ReturnType<typeof getPageDataWithFallback>>) {
    const { page, space, customization, site } = input;
    return [page.title, getContentTitle(space, customization, site ?? null)]
        .filter(Boolean)
        .join(' | ');
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    // We only generate metadata in navigation mode. Else we let the browser handle it.
    if (await checkIsInAppNavigation()) {
        return {};
    }

    const data = await getPageDataWithFallback(props, { redirectOnFallback: false });

    const { page, pages, space, customization, site, ancestors } = data;

    return {
        title: getTitle(data),
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
        robots:
            isSpaceIndexable({ space, site: site ?? null }) && isPageIndexable(ancestors, page)
                ? 'index, follow'
                : 'noindex, nofollow',
    };
}

/**
 * Check if the navigation is in-app, meaning the user clicks on a link.
 */
async function checkIsInAppNavigation() {
    const headerList = await headers();
    const fetchMode = headerList.get('sec-fetch-mode');

    return fetchMode === 'cors';
}

/**
 * Fetches the page data matching the requested pathname and fallback to root page when page is not found.
 */
async function getPageDataWithFallback(
    props: PageProps,
    behaviour: {
        redirectOnFallback: boolean;
    },
) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { params, searchParams } = props;
    const { redirectOnFallback } = behaviour;

    const { pages, page: targetPage, ...otherPageData } = await fetchPageData(params);

    let page = targetPage;
    const canFallback = !!searchParams.fallback;
    if (!page && canFallback) {
        const rootPage = resolveFirstDocument(pages, []);

        if (redirectOnFallback && rootPage?.page) {
            redirect(pageHref(pages, rootPage?.page));
        }

        page = rootPage?.page;
    }

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

    return {
        ...otherPageData,
        pages,
        page,
    };
}
