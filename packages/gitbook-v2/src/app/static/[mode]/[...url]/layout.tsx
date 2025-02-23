import { unstable_cacheTag as cacheTag } from 'next/cache';
import { SiteContentLayout } from '@v2/components/routes/SiteContentLayout';
import { getSiteCacheTag } from '@v2/lib/cache';
import { createStaticSiteContext } from '@v2/lib/context';

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<{ url: string[] }>;
    children: React.ReactNode;
}) {
    'use cache';

    const { url } = await params;
    const context = await createStaticSiteContext(url);

    cacheTag(getSiteCacheTag(context.siteId));

    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
