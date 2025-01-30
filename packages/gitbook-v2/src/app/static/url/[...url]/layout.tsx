import { unstable_cacheTag as cacheTag } from 'next/cache';
import { SiteContentLayout } from '@/components/routes/SiteContentLayout';
import { getSiteCacheTag } from '@/lib/cache';
import { createStaticSiteContext } from '@/lib/context';

export default async function RootLayout({
    params,
    children,
  }: {
    params: Promise<{ url: string[] }>
    children: React.ReactNode
  }) {
    'use cache';

    const { url } = await params;
    const context = await createStaticSiteContext(url);

    cacheTag(getSiteCacheTag(context.siteId));
   
    return <SiteContentLayout context={context}>{children}</SiteContentLayout>;
}
