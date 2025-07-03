import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { GITBOOK_DISABLE_TRACKING } from '@/lib/env';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteStaticLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const { context, visitorAuthClaims } = await getStaticSiteContext(await params);

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
