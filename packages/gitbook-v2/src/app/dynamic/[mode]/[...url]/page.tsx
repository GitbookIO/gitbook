import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';
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

export default async function Page({ params }: { params: Promise<RouteParams> }) {
    const { context, pathname } = await getDynamicSiteContext(await params);

    return <SitePage context={context} pageParams={{ pathname }} redirectOnFallback={true} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const { context } = await getDynamicSiteContext(await props.params);
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { context, pathname } = await getDynamicSiteContext(await props.params);
    const searchParams = await props.searchParams;

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
        redirectOnFallback: true,
        fallback: !!searchParams.fallback,
    });
}
