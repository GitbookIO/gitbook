import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayout } from '@/components/SiteLayout';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';
import { getSiteCacheTag } from '@v2/lib/cache';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';
import { unstable_cacheTag as cacheTag } from 'next/cache';

export default async function SiteStaticLayout({
    params,
    children,
}: {
    params: Promise<RouteLayoutParams>;
    children: React.ReactNode;
}) {
    'use cache';

    const context = await getStaticSiteContext(await params);

    cacheTag(getSiteCacheTag(context.site.id));

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayout context={context} withTracking={!GITBOOK_DISABLE_TRACKING}>
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}
