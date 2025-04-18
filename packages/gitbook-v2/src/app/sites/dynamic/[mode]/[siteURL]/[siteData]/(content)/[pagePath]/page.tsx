import {
    SitePage,
    generateSitePageMetadata,
    generateSitePageViewport,
} from '@/components/SitePage';
import { type RouteParams, getDynamicSiteContext, getPagePathFromParams } from '@v2/app/utils';
import type { Metadata, Viewport } from 'next';

type PageProps = {
    params: Promise<RouteParams>;
    searchParams: Promise<{ fallback?: string }>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return <SitePage context={context} pageParams={{ pathname }} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const { context } = await getDynamicSiteContext(await props.params);
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { context } = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
    });
}
