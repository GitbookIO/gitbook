import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { getCacheTag } from '@gitbook/cache-tags';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';
import { unstable_cacheTag as cacheTag } from 'next/cache';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteStaticLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    'use cache';

    const { context, visitorAuthClaims } = await getStaticSiteContext(await params);

    cacheTag(
        getCacheTag({
            tag: 'site',
            site: context.site.id,
        })
    );

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayout
                context={context}
                withTracking={!GITBOOK_DISABLE_TRACKING}
                visitorAuthClaims={visitorAuthClaims}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SiteStaticLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SiteStaticLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutMetadata(context);
}
