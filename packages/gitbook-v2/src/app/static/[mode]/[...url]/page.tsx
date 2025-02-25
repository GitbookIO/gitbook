import { unstable_cacheTag as cacheTag } from 'next/cache';
import { getSiteCacheTag } from '@v2/lib/cache';
import { getStaticSiteContext, RouteParams } from '@v2/app/utils';
import { SitePage } from '@/components/SitePage';

export const dynamic = 'force-static';

export default async function Page({ params }: { params: Promise<RouteParams> }) {
    'use cache';

    const { context, pathname } = await getStaticSiteContext(await params);

    cacheTag(getSiteCacheTag(context.site.id));

    return <SitePage context={context} pageParams={{ pathname }} redirectOnFallback={true} />;
}
