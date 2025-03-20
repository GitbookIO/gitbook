import {
    SitePage,
    generateSitePageMetadata,
    generateSitePageViewport,
} from '@/components/SitePage';
import { getCacheTag } from '@gitbook/cache-tags';
import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@v2/app/utils';
import type { Metadata, Viewport } from 'next';
import { unstable_cacheTag as cacheTag } from 'next/cache';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    'use cache';

    const params = await props.params;
    const { context } = await getStaticSiteContext(params);
    const pathname = getPagePathFromParams(params);

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    );

    return <SitePage context={context} pageParams={{ pathname }} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const { context } = await getStaticSiteContext(await props.params);
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { context } = await getStaticSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
    });
}
