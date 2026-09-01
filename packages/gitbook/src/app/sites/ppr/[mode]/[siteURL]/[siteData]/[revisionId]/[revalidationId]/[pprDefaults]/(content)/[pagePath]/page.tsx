import type { Metadata, Viewport } from 'next';

import { type PPRRouteParams, getPPRPageRouteParams, getPagePathFromParams } from '@/app/utils';
import {
    PPRPageBody,
    cachedGenerateSitePageMetadata,
    cachedGenerateSitePageViewport,
} from '@/components/SitePage/PPRSitePage';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<PPRRouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const pathname = getPagePathFromParams(params);

    return <PPRPageBody params={await getPPRPageRouteParams(params)} pathname={pathname} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const params = await props.params;
    return cachedGenerateSitePageViewport(await getPPRPageRouteParams(params));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    return cachedGenerateSitePageMetadata(await getPPRPageRouteParams(params));
}
