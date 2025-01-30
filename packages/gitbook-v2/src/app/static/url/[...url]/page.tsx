import { unstable_cacheTag as cacheTag } from 'next/cache';
import { createStaticSiteContext } from "@/lib/context";
import { getSiteCacheTag } from '@/lib/cache';
import { SiteContentPage } from '@/components/routes/SiteContentPage';

export default async function Page({
    params,
  }: {
    params: Promise<{ url: string[] }>
}) {
    'use cache';

    const { url } = await params;
    const context = await createStaticSiteContext(url);

    cacheTag(getSiteCacheTag(context.siteId));
   
    return <SiteContentPage context={context} />;
}