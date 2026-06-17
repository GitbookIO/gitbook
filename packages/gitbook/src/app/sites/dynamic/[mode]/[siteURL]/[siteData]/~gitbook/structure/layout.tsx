import type React from 'react';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import { SiteLayoutClientContexts } from '@/components/SiteLayout/SiteLayoutClientContexts';
import { getThemeFromMiddleware } from '@/lib/middleware';

interface SiteDynamicLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function RootLayout({
    children,
    ...props
}: React.PropsWithChildren<SiteDynamicLayoutProps>) {
    const { context } = await getDynamicSiteContext(await props.params);
    const forcedTheme = await getThemeFromMiddleware();
    return (
        <CustomizationRootLayout
            htmlClassName="sheet-open:gutter-stable overflow-hidden site-background"
            bodyClassName="site-background"
            forcedTheme={forcedTheme}
            context={context}
        >
            <SiteLayoutClientContexts
                contextId={context.contextId}
                forcedTheme={
                    forcedTheme ??
                    (context.customization.themes.toggeable
                        ? undefined
                        : context.customization.themes.default)
                }
                defaultTheme={context.customization.themes.default}
                themeStorageKey={`gitbook-theme-structure:${context.site.id}`}
                externalLinksTarget={context.customization.externalLinks.target}
                proxyOrigin={context.site.proxy?.origin}
            >
                {children}
            </SiteLayoutClientContexts>
        </CustomizationRootLayout>
    );
}
