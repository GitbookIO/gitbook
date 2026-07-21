import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { SpaceHeader, SpaceTableOfContents } from '@/components/SpaceLayout';

import { SitePage } from './SitePage';

/**
 * Render the header from cache without carrying a request-scoped data fetcher into the cache key.
 */
export async function PPRHeader(props: { params: RouteLayoutParams }) {
    'use cache';

    const { context } = await getStaticSiteContext(props.params);
    return <SpaceHeader context={context} />;
}

/**
 * Render the table of contents independently so navigation changes do not invalidate the header.
 */
export async function PPRTableOfContents(props: { params: RouteLayoutParams }) {
    'use cache';

    const { context } = await getStaticSiteContext(props.params);
    return <SpaceTableOfContents context={context} />;
}

/**
 * Render the page body independently from the shared navigation shell.
 */
export async function PPRPageBody(props: { params: RouteLayoutParams; pathname: string }) {
    'use cache';

    const { context } = await getStaticSiteContext(props.params);
    return <SitePage context={context} pageParams={{ pathname: props.pathname }} staticRoute />;
}
