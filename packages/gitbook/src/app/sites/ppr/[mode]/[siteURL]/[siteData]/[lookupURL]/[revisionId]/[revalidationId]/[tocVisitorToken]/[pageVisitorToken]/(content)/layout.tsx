import { type PPRRouteLayoutParams, getPPRRouteParams, getStaticSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { PPRHeader, PPRTableOfContents } from '@/components/SitePage/PPRSitePage';
import { shouldTrackEvents } from '@/lib/tracking';

import type React from 'react';

interface SitePPRLayoutProps {
    params: Promise<PPRRouteLayoutParams>;
}

export default async function SitePPRLayout({
    params,
    children,
}: React.PropsWithChildren<SitePPRLayoutProps>) {
    const routeParams = await params;
    const headerParams = getPPRRouteParams(routeParams);
    const { context, visitorAuthClaims } = await getStaticSiteContext(headerParams);
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
                headerSlot={<PPRHeader params={headerParams} />}
                tableOfContentsSlot={<PPRTableOfContents params={routeParams} />}
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SitePPRLayoutProps) {
    const { context } = await getStaticSiteContext(getPPRRouteParams(await params));
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SitePPRLayoutProps) {
    const { context } = await getStaticSiteContext(getPPRRouteParams(await params));
    return generateSiteLayoutMetadata(context);
}
