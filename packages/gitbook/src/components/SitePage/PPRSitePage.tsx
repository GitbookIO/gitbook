import {
    type RouteLayoutParams,
    type RouteParams,
    getPPRStaticSiteContext,
    getPagePathFromParams,
} from '@/app/utils';
import { SpaceHeader, SpaceTableOfContents } from '@/components/SpaceLayout';

import { cacheLife } from 'next/cache';

import type { Metadata, Viewport } from 'next';
import { SitePage, generateSitePageMetadata, generateSitePageViewport } from './SitePage';

// Each component below resolves its context under its own PPR cache scope. The scope is part of the
// cache key of every data fetcher, so the tags they emit are scoped too and propagate up to the
// entry here — making the component and the data it read a single revalidatable unit. No explicit
// `cacheTag` is needed, and adding one would only duplicate a propagated tag.

/**
 * Render the header from cache without carrying a request-scoped data fetcher into the cache key.
 */
export async function PPRHeader(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'header');

    return <SpaceHeader context={context} />;
}

/**
 * Render the table of contents independently so navigation changes do not invalidate the header.
 */
export async function PPRTableOfContents(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'toc');

    return <SpaceTableOfContents context={context} />;
}

/**
 * Render the page body independently from the shared navigation shell.
 */
export async function PPRPageBody(props: { params: RouteParams; pathname: string }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'body');

    return <SitePage context={context} pageParams={{ pathname: props.pathname }} staticRoute />;
}

export async function cachedGenerateSitePageMetadata(routeParams: RouteParams): Promise<Metadata> {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(routeParams, 'body');
    const pathname = getPagePathFromParams(routeParams);

    return generateSitePageMetadata({ context, pageParams: { pathname } });
}

export async function cachedGenerateSitePageViewport(routeParams: RouteParams): Promise<Viewport> {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(routeParams, 'body');

    return generateSitePageViewport(context);
}
