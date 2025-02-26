import { unstable_cacheTag as cacheTag } from 'next/cache';
import { getSiteCacheTag } from '@v2/lib/cache';
import { getPagePathFromParams, getStaticSiteContext, RouteParams } from '@v2/app/utils';
import {
    generateSitePageMetadata,
    generateSitePageViewport,
    SitePage,
} from '@/components/SitePage';
import { Metadata, Viewport } from 'next';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    'use cache';

    const params = await props.params;
    const context = await getStaticSiteContext(params);
    const pathname = getPagePathFromParams(params);

    cacheTag(getSiteCacheTag(context.site.id));

    return <SitePage context={context} pageParams={{ pathname }} redirectOnFallback={true} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const context = await getStaticSiteContext(await props.params);
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const context = await getStaticSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
        redirectOnFallback: true,
    });
}
