import { getDynamicSiteContext, getPagePathFromParams, RouteParams } from '@v2/app/utils';
import {
    generateSitePageMetadata,
    generateSitePageViewport,
    SitePage,
} from '@/components/SitePage';
import { Metadata, Viewport } from 'next';

type PageProps = {
    params: Promise<RouteParams>;
    searchParams: Promise<{ fallback?: string }>;
};

export default async function Page(props: { params: Promise<RouteParams> }) {
    const params = await props.params;
    const context = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return <SitePage context={context} pageParams={{ pathname }} redirectOnFallback={true} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const context = await getDynamicSiteContext(await props.params);
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const context = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);
    const searchParams = await props.searchParams;

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
        redirectOnFallback: true,
        fallback: !!searchParams.fallback,
    });
}
