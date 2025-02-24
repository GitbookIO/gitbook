import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayout } from '@/components/SiteLayout';
import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';
import { getThemeFromMiddleware } from '@v2/lib/middleware';

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<RouteParams>;
    children: React.ReactNode;
}) {
    const context = await getDynamicSiteContext(await params);
    const forcedTheme = await getThemeFromMiddleware();

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayout nonce="TODO" context={context} forcedTheme={forcedTheme} withTracking={!GITBOOK_DISABLE_TRACKING}>{children}</SiteLayout>
        </CustomizationRootLayout>
    );
}
