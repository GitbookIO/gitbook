import {
    SitePage,
    generateSitePageMetadata,
    generateSitePageViewport,
} from '@/components/SitePage';
import type { RouteParams } from '@v2/app/utils';
import { getPrefetchedDataFromLayoutParams } from '@v2/lib/data/memoize';

import type { Metadata, Viewport } from 'next';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { staticSiteContext } = getPrefetchedDataFromLayoutParams(params);
    const { context } = await staticSiteContext;

    return <SitePage context={context} pageParams={params} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const params = await props.params;
    const { context } = await getPrefetchedDataFromLayoutParams(params).staticSiteContext;
    return generateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { context } = await getPrefetchedDataFromLayoutParams(params).staticSiteContext;

    return generateSitePageMetadata({
        context,
        pageParams: params,
    });
}
