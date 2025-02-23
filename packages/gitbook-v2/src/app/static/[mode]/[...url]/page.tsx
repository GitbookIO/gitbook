import { unstable_cacheTag as cacheTag } from 'next/cache';
import { createStaticSiteContext } from '@v2/lib/context';
import { getSiteCacheTag } from '@v2/lib/cache';
import { SiteContentPage } from '@v2/components/routes/SiteContentPage';

export const dynamic = 'force-static';

export default async function Page({ params }: { params: Promise<{ url: string[] }> }) {
    'use cache';

    const { url } = await params;
    const context = await createStaticSiteContext(url);

    cacheTag(getSiteCacheTag(context.siteId));

    return <SiteContentPage context={context} />;
}
