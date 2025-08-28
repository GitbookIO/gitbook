import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { getThemeFromMiddleware } from '@/lib/middleware';
import { shouldTrackEvents } from '@/lib/tracking';
import { headers } from 'next/headers';

interface SiteDynamicLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteDynamicLayout({
    params,
    children,
}: React.PropsWithChildren<SiteDynamicLayoutProps>) {
    const { context, visitorAuthClaims } = await getDynamicSiteContext(await params);
    const forcedTheme = await getThemeFromMiddleware();
    const withTracking = shouldTrackEvents(await headers());

    return (
        <CustomizationRootLayout forcedTheme={forcedTheme} context={context}>
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
