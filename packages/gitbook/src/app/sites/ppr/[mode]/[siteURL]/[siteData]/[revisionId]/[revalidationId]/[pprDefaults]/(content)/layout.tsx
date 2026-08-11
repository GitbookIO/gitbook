import {
    type PPRRouteLayoutParams,
    getPPRHeaderRouteParams,
    getPPRRouteParams,
    getPPRStaticSiteContext,
    getPPRTableOfContentsRouteParams,
} from '@/app/utils';
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
    const pageParams = getPPRRouteParams(routeParams);
    const headerParams = getPPRHeaderRouteParams(routeParams);
    const tableOfContentsParams = getPPRTableOfContentsRouteParams(routeParams);
    const { context, visitorAuthClaims } = await getPPRStaticSiteContext(pageParams);
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
                tableOfContentsSlot={<PPRTableOfContents params={tableOfContentsParams} />}
                // The header and table of contents are cached across pages, so the selection they
                // were rendered with belongs to another page and has to be resolved on the client.
                clientNavigationSelection
            >
                {children}
            </SiteLayout>
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SitePPRLayoutProps) {
    const { context } = await getPPRStaticSiteContext(getPPRRouteParams(await params));
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SitePPRLayoutProps) {
    const { context } = await getPPRStaticSiteContext(getPPRRouteParams(await params));
    return generateSiteLayoutMetadata(context);
}
