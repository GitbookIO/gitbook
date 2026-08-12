import {
    type RouteLayoutParams,
    type RouteParams,
    getPPRStaticSiteContext,
    getPagePathFromParams,
} from '@/app/utils';
import { SpaceHeader, SpaceTableOfContents } from '@/components/SpaceLayout';
import { prefixCacheTags } from '@/lib/cache-tags';

import { getCacheTag } from '@gitbook/cache-tags';

import { cacheLife, cacheTag } from 'next/cache';

import type { Metadata, Viewport } from 'next';
import { SitePage, generateSitePageMetadata, generateSitePageViewport } from './SitePage';

/**
 * Render the header from cache without carrying a request-scoped data fetcher into the cache key.
 */
export async function PPRHeader(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    console.log('PPRHeader props.params', props.params);

    const { context } = await getPPRStaticSiteContext(props.params);

    // We only need the site cache tag for the header, as the header is not dependent on the page or space content.
    cacheTag(
        ...prefixCacheTags(
            [
                getCacheTag({
                    tag: 'site',
                    site: context.site.id,
                }),
            ],
            true
        )
    ); // Tag the cache entry for the header so it can be invalidated when the site changes

    return <SpaceHeader context={context} />;
}

/**
 * Render the table of contents independently so navigation changes do not invalidate the header.
 */
export async function PPRTableOfContents(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    console.log('PPRTableOfContents props.params', props.params);

    const { context } = await getPPRStaticSiteContext(props.params);

    return <SpaceTableOfContents context={context} />;
}

/**
 * Render the page body independently from the shared navigation shell.
 */
export async function PPRPageBody(props: { params: RouteParams; pathname: string }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    console.log('PPRPageBody: caching page body for', props.pathname);
    const { context } = await getPPRStaticSiteContext(props.params);

    return <SitePage context={context} pageParams={{ pathname: props.pathname }} staticRoute />;
}

export async function cachedGenerateSitePageMetadata(routeParams: RouteParams): Promise<Metadata> {
    'use cache: remote';

    const { context } = await getPPRStaticSiteContext(routeParams);
    const pathname = getPagePathFromParams(routeParams);
    cacheLife('days'); // Cache for 1 day

    return generateSitePageMetadata({ context, pageParams: { pathname } });
}

export async function cachedGenerateSitePageViewport(routeParams: RouteParams): Promise<Viewport> {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(routeParams);

    cacheTag(
        ...prefixCacheTags(
            [
                // Tag the cache entry for the metadata so it can be invalidated when the site changes
                getCacheTag({
                    tag: 'site',
                    site: context.site.id,
                }),
                // ...or when the space changes
                getCacheTag({
                    tag: 'space',
                    space: context.space.id,
                }),
            ],
            true
        )
    );

    return generateSitePageViewport(context);
}
