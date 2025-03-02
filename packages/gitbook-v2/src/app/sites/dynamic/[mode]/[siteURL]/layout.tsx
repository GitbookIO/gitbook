import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';
import { getThemeFromMiddleware, getVisitorAuthTokenFromMiddleware } from '@v2/lib/middleware';

interface SiteDynamicLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteDynamicLayout({
    params,
    children,
}: React.PropsWithChildren<SiteDynamicLayoutProps>) {
    const context = await getDynamicSiteContext(await params);
    const forcedTheme = await getThemeFromMiddleware();
    const visitorAuthToken = await getVisitorAuthTokenFromMiddleware();

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayout
                context={context}
                forcedTheme={forcedTheme}
                visitorAuthToken={visitorAuthToken}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SiteDynamicLayoutProps) {
    const context = await getDynamicSiteContext(await params);
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SiteDynamicLayoutProps) {
    const context = await getDynamicSiteContext(await params);
    return generateSiteLayoutMetadata(context);
}
