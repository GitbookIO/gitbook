import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { SpaceHeader, SpaceTableOfContents } from '@/components/SpaceLayout';

import { getCacheTag } from '@gitbook/cache-tags';

import { cacheLife, cacheTag, unstable_cache } from 'next/cache';

import type { GitBookSiteContext } from '@/lib/context';
import type { Metadata, Viewport } from 'next';
import {
    SitePage,
    type SitePageProps,
    generateSitePageMetadata,
    generateSitePageViewport,
} from './SitePage';

/**
 * Render the header from cache without carrying a request-scoped data fetcher into the cache key.
 */
export async function PPRHeader(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    //TODO: remove these console logs after debugging
    console.log('PPRHeader');

    const { context } = await getStaticSiteContext(props.params);

    // We only need the site cache tag for the header, as the header is not dependent on the page or space content.
    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    ); // Tag the cache entry for the header so it can be invalidated when the site changes

    return <SpaceHeader context={context} />;
}

/**
 * Render the table of contents independently so navigation changes do not invalidate the header.
 */
export async function PPRTableOfContents(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    console.log('PPRTableOfContents');

    const { context } = await getStaticSiteContext(props.params);

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    ); // Tag the cache entry for the table of contents so it can be invalidated when the site changes

    cacheTag(
        getCacheTag({
            tag: 'space',
            space: context.space.id,
        })
    ); // Tag the cache entry for the table of contents so it can be invalidated when the space changes

    return <SpaceTableOfContents context={context} />;
}

/**
 * Render the page body independently from the shared navigation shell.
 */
export async function PPRPageBody(props: { params: RouteLayoutParams; pathname: string }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day
    const { context } = await getStaticSiteContext(props.params);

    console.log('PPRPageBody');

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    ); // Tag the cache entry for the table of contents so it can be invalidated when the site changes

    cacheTag(
        getCacheTag({
            tag: 'space',
            space: context.space.id,
        })
    ); // Tag the cache entry for the table of contents so it can be invalidated when the space changes

    cacheTag(
        getCacheTag({
            tag: 'document',
            space: context.space.id,
            document: props.pathname,
        })
    ); // Tag the cache entry for the table of contents so it can be invalidated when the document changes

    return <SitePage context={context} pageParams={{ pathname: props.pathname }} staticRoute />;
}

// It looks like we cannot use use cache for this one.
export const cachedGenerateSitePageMetadata = (props: SitePageProps): (() => Promise<Metadata>) => {
    return unstable_cache(
        async () => generateSitePageMetadata(props),
        ['cachedGenerateSitePageMetadata'],
        {
            revalidate: 60 * 60 * 24, // Revalidate every 24 hours
            tags: [
                getCacheTag({
                    tag: 'site',
                    site: props.context.site.id,
                }),
                getCacheTag({
                    tag: 'space',
                    space: props.context.space.id,
                }),
            ],
        }
    );
};

export async function cachedGenerateSitePageViewport(
    context: GitBookSiteContext
): Promise<Viewport> {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    ); // Tag the cache entry for the metadata so it can be invalidated when the site changes

    cacheTag(
        getCacheTag({
            tag: 'space',
            space: context.space.id,
        })
    ); // Tag the cache entry for the metadata so it can be invalidated when the space changes

    return generateSitePageViewport(context);
}
