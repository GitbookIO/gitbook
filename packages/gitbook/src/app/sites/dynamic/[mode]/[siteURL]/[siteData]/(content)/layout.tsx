import { headers } from 'next/headers';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { getThemeFromMiddleware } from '@/lib/middleware';
import { shouldTrackEvents } from '@/lib/tracking';

interface SiteDynamicLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteDynamicLayout({
    params,
    children,
}: React.PropsWithChildren<SiteDynamicLayoutProps>) {
    const resolvedParams = await params;
    const { context, visitorAuthClaims } = await getDynamicSiteContext(resolvedParams);
    const forcedTheme = await getThemeFromMiddleware();
    const withTracking = shouldTrackEvents(resolvedParams.mode, await headers());

    return (
        <CustomizationRootLayout
            htmlClassName="sheet-open:gutter-stable"
            bodyClassName="site-background"
            forcedTheme={forcedTheme}
            context={context}
        >
            <SiteLayout
                context={context}
                forcedTheme={forcedTheme}
                withTracking={withTracking}
                visitorAuthClaims={visitorAuthClaims}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SiteDynamicLayoutProps) {
    const { context } = await getDynamicSiteContext(await params);
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SiteDynamicLayoutProps) {
    const { context } = await getDynamicSiteContext(await params);
    return generateSiteLayoutMetadata(context);
}
