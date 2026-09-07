import type { Metadata, Viewport } from 'next';
import { cacheLife } from 'next/cache';

import { IconsProvider } from '@gitbook/icons';

import { SitePage, generateSitePageMetadata, generateSitePageViewport } from './SitePage';
import {
    type RouteLayoutParams,
    type RouteParams,
    getPPRStaticSiteContext,
    getPagePathFromParams,
} from '@/app/utils';
import { AdminToolbar } from '@/components/AdminToolbar';
import { Announcement } from '@/components/Announcement';
import { Footer } from '@/components/Footer';
import { SpaceHeader, SpaceTableOfContents } from '@/components/SpaceLayout';
import {
    getContentInlineIconSourceRequests,
    getCustomizationIconStyle,
    getInlineIconSources,
} from '@/lib/icons/inline';

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
 * Render the announcement banner, which resolves its link against the revision.
 */
export async function PPRAnnouncement(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'toc');

    return <Announcement context={context} />;
}

/**
 * Render the footer, whose links resolve against the revision.
 */
export async function PPRFooter(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'toc');

    return <Footer context={context} />;
}

/**
 * Render the admin toolbar, which reports on the revision and its change request.
 */
export async function PPRAdminToolbar(props: { params: RouteLayoutParams }) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'toc');

    return <AdminToolbar context={context} />;
}

/**
 * Provide the icons of the pages and tags of the revision to the tree below.
 *
 * The header and the body both render them, so they are resolved once here rather than duplicated
 * in every per-page cache entry. The provider merges with the one of the root layout, which carries
 * the site-level icons.
 */
export async function PPRRevisionIconsProvider(
    props: React.PropsWithChildren<{ params: RouteLayoutParams }>
) {
    'use cache: remote';
    cacheLife('days'); // Cache for 1 day

    const { context } = await getPPRStaticSiteContext(props.params, 'toc');
    const iconSources = await getInlineIconSources(
        getContentInlineIconSourceRequests({
            iconStyle: getCustomizationIconStyle(context.customization),
            pages: context.revision.pages,
            tags: context.revision.tags,
        })
    );

    return <IconsProvider iconSources={iconSources}>{props.children}</IconsProvider>;
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
