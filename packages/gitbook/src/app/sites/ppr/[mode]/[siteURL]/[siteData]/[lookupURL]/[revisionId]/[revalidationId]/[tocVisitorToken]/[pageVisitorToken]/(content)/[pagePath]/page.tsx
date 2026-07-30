import { type PPRRouteParams, getPagePathFromParams } from '@/app/utils';
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

    return <PPRPageBody params={params} pathname={pathname} />;
}

export async function generateViewport(props: PageProps): Promise<Viewport> {
    const params = await props.params;
    return cachedGenerateSitePageViewport(params);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    return cachedGenerateSitePageMetadata(params);
}
