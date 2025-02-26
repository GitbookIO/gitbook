import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayout } from '@/components/SiteLayout';
import { getDynamicSiteContext, RouteLayoutParams } from '@v2/app/utils';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';
import { getThemeFromMiddleware } from '@v2/lib/middleware';

export default async function SiteDynamicLayout({
    params,
    children,
}: {
    params: Promise<RouteLayoutParams>;
    children: React.ReactNode;
}) {
    const context = await getDynamicSiteContext(await params);
    const forcedTheme = await getThemeFromMiddleware();

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayout
                context={context}
                forcedTheme={forcedTheme}
                withTracking={!GITBOOK_DISABLE_TRACKING}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}
