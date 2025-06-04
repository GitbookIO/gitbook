import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteStaticLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const { context, visitorAuthClaims } = await getStaticSiteContext(await params);

    if (context.site.id === 'site_JOVzv') {
        // @ts-expect-error: TODO: remove this once we have a proper customization setting for this
        context.customization.styling.corners = 'circular';
        // @ts-expect-error: TODO: remove this once we have a proper customization setting for this
        context.customization.styling.depth = 'flat';
    }

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
