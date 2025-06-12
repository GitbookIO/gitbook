import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';
import { cachedDate, getPrefetchedDataFromLayoutParams } from '@v2/lib/data/memoize';
import { GITBOOK_DISABLE_TRACKING } from '@v2/lib/env';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SiteStaticLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const startedAt = cachedDate();
    console.info(`SiteStaticLayout: Starting to render static site layout at ${startedAt}`);
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
    const prefetchedData = getPrefetchedDataFromLayoutParams(await params);
    return generateSiteLayoutMetadata(prefetchedData);
}
