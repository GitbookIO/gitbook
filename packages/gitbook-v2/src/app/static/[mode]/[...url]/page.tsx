import { unstable_cacheTag as cacheTag } from 'next/cache';
import { getSiteCacheTag } from '@v2/lib/cache';
import { SiteContentPage } from '@v2/components/routes/SiteContentPage';
import { getStaticSiteContext, RouteParams } from '@v2/app/utils';

export const dynamic = 'force-static';

export default async function Page({ params }: { params: Promise<RouteParams> }) {
    'use cache';

    const context = await getStaticSiteContext(await params);

    cacheTag(getSiteCacheTag(context.site.id));

    return <SiteContentPage context={context} />;
}
