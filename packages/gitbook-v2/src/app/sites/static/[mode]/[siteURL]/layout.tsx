import { unstable_cacheTag as cacheTag } from 'next/cache';
import { getSiteCacheTag } from '@v2/lib/cache';
import { getStaticSiteContext, RouteLayoutParams } from '@v2/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayout } from '@/components/SiteLayout';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';

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
