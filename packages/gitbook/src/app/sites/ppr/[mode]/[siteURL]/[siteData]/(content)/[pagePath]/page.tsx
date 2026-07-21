import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@/app/utils';
import {
    PPRPageBody,
    generateSitePageMetadata,
    generateSitePageViewport,
} from '@/components/SitePage';

import type { Metadata, Viewport } from 'next';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const pathname = getPagePathFromParams(params);

    return <PPRPageBody params={params} pathname={pathname} />;
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
