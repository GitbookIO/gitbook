import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout/CustomizationRootLayout';
import { getThemeFromMiddleware } from '@/lib/middleware';

/**
 * Layout for the sites OAuth consent screen.
 */
export default async function Layout({
    params,
    children,
}: React.PropsWithChildren<{ params: Promise<RouteLayoutParams> }>) {
    const { context } = await getDynamicSiteContext(await params);
    const forcedTheme = await getThemeFromMiddleware();

    return (
        <CustomizationRootLayout context={context} forcedTheme={forcedTheme}>
            {children}
        </CustomizationRootLayout>
    );
}
