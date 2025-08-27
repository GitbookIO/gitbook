import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { shouldTrackEvents } from '@/lib/tracking';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteStaticLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const { context, visitorAuthClaims } = await getStaticSiteContext(await params);
    const withTracking = shouldTrackEvents();

    return (
        <CustomizationRootLayout context={context}>
            <SiteLayout
                context={context}
                withTracking={withTracking}
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
