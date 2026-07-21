import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { PPRHeader, PPRTableOfContents } from '@/components/SitePage/PPRSitePage';
import { shouldTrackEvents } from '@/lib/tracking';

interface SitePPRLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function SitePPRLayout({
    params,
    children,
}: React.PropsWithChildren<SitePPRLayoutProps>) {
    const routeParams = await params;
    const { context, visitorAuthClaims } = await getStaticSiteContext(routeParams);
    const withTracking = shouldTrackEvents();

    return (
        <CustomizationRootLayout
            htmlClassName="sheet-open:gutter-stable"
            bodyClassName="site-background"
            context={context}
        >
            <SiteLayout
                context={context}
                withTracking={withTracking}
                visitorAuthClaims={visitorAuthClaims}
                headerSlot={<PPRHeader params={routeParams} />}
                tableOfContentsSlot={<PPRTableOfContents params={routeParams} />}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SitePPRLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SitePPRLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutMetadata(context);
}
