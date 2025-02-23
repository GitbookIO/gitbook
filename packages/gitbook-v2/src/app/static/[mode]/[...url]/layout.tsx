import { unstable_cacheTag as cacheTag } from 'next/cache';
import { SiteContentLayout } from '@v2/components/routes/SiteContentLayout';
import { getSiteCacheTag } from '@v2/lib/cache';
import { getStaticSiteContext, RouteParams } from '@v2/app/utils';

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<RouteParams>;
    children: React.ReactNode;
}) {
    'use cache';

    const context = await getStaticSiteContext(await params);

    cacheTag(getSiteCacheTag(context.site.id));

    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
