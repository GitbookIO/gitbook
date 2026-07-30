import {
    type PPRRouteParams,
    getPPRRouteParams,
    getPagePathFromParams,
    getStaticSiteContext,
} from '@/app/utils';
import {
    PPRPageBody,
    cachedGenerateSitePageMetadata,
    cachedGenerateSitePageViewport,
} from '@/components/SitePage';

import type { Metadata, Viewport } from 'next';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<PPRRouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const pathname = getPagePathFromParams(params);

    return <PPRPageBody params={getPPRRouteParams(params, 'page')} pathname={pathname} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const params = await props.params;
    const { context } = await getStaticSiteContext(getPPRRouteParams(params, 'page'));
    return cachedGenerateSitePageViewport(context);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const correctParams = getPPRRouteParams(params, 'page');
    const { context } = await getStaticSiteContext(correctParams);
    const pathname = getPagePathFromParams(correctParams);

    return cachedGenerateSitePageMetadata({
        context,
        pageParams: { pathname },
    });
}
