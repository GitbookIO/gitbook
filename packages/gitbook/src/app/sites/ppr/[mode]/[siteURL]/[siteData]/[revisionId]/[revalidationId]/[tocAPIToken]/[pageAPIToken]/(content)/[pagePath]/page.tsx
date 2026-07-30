import { type PPRRouteParams, getPPRRouteParams, getPagePathFromParams } from '@/app/utils';
import {
    PPRPageBody,
    cachedGenerateSitePageMetadata,
    cachedGenerateSitePageViewport,
} from '@/components/SitePage/PPRSitePage';

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
    return cachedGenerateSitePageViewport(getPPRRouteParams(params, 'page'));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const correctParams = getPPRRouteParams(params, 'page');

    return cachedGenerateSitePageMetadata(correctParams);
}
