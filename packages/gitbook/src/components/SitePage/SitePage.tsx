import { CustomizationHeaderPreset, CustomizationThemeMode } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

import { PageAside } from '@/components/PageAside';
import { PageBody, PageCover } from '@/components/PageBody';
import { getPagePath } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';

import type { RouteParams } from '@v2/app/utils';
import { getPrefetchedDataFromPageParams } from '@v2/lib/data/memoize';
import { getResizedImageURL } from '@v2/lib/images';
import { PageContextProvider } from '../PageContext';
import { PageClientLayout } from './PageClientLayout';
import { getPathnameParam } from './fetch';

export type SitePageProps = {
    context: GitBookSiteContext;
    pageParams: RouteParams;
};

/**
 * Fetch and render a page.
 */
export async function SitePage(props: SitePageProps) {
    console.log('Rendering site page', props.pageParams);
    const prefetchedData = getPrefetchedDataFromPageParams(props.pageParams);
    const { context, pageTarget } = await prefetchedData.pageData;

    const rawPathname = getPathnameParam({
        pathname: props.pageParams.pagePath,
    });
    if (!pageTarget) {
        const pathname = rawPathname.toLowerCase();
        if (pathname !== rawPathname) {
            // If the pathname was not normalized, redirect to the normalized version
            // before trying to resolve the page again
            redirect(context.linker.toPathInSpace(pathname));
        } else {
            notFound();
        }
    } else if (getPagePath(context.pages, pageTarget.page) !== rawPathname) {
        console.log('Redirecting to page path', rawPathname, 'for page', pageTarget.page.id);
        // redirect(
        //     context.linker.toPathForPage({
        //         pages: context.pages,
        //         page: pageTarget.page,
        //     })
        // );
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

    const document = await prefetchedData.document;

    return (
        <PageContextProvider pageId={page.id} spaceId={context.space.id} title={page.title}>
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
                    prefetchedRef={prefetchedData.prefetchedRef}
                />
            </div>
            <React.Suspense fallback={null}>
                <PageClientLayout withSections={withSections} />
            </React.Suspense>
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
    const { context, pageTarget } = await getPrefetchedDataFromPageParams(props.pageParams)
        .pageData;

    if (!pageTarget) {
        notFound();
    }

    const { page, ancestors } = pageTarget;
    const { site, customization, pages, linker, imageResizer } = context;

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
