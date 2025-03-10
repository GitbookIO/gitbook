import type { Metadata, Viewport } from 'next';

import {
    type PagePathParams,
    SitePage,
    generateSitePageMetadata,
    generateSitePageViewport,
} from '@/components/SitePage';
import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<PagePathParams>;
    searchParams: Promise<{ fallback?: string }>;
};

/**
 * Fetch and render a page.
 */
export default async function Page(props: PageProps) {
    const sitePageProps = await getSitePageProps(props);
    return <SitePage {...sitePageProps} />;
}

export async function generateViewport(): Promise<Viewport> {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const sitePageProps = await getSitePageProps(props);
    return generateSitePageMetadata(sitePageProps);
}

async function getSitePageProps(props: PageProps) {
    const { params: rawParams } = props;

    const params = await rawParams;

    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return {
        context,
        pageParams: params,
    };
}
