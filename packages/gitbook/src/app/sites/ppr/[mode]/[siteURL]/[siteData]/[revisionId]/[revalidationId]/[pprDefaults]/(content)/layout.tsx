import type React from 'react';

import {
    type PPRRouteLayoutParams,
    getPPRHeaderRouteParams,
    getPPRPageRouteParams,
    getPPRStaticSiteContext,
    getPPRTableOfContentsRouteParams,
    getPPRVisitorAuthClaims,
} from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { PPRHeader, PPRTableOfContents } from '@/components/SitePage/PPRSitePage';
import { shouldTrackEvents } from '@/lib/tracking';

interface SitePPRLayoutProps {
    params: Promise<PPRRouteLayoutParams>;
}

export default async function SitePPRLayout({
    params,
    children,
}: React.PropsWithChildren<SitePPRLayoutProps>) {
    const routeParams = await params;
    const [pageParams, headerParams, tableOfContentsParams, visitorAuthClaims] = await Promise.all([
        getPPRPageRouteParams(routeParams),
        getPPRHeaderRouteParams(routeParams),
        getPPRTableOfContentsRouteParams(routeParams),
        // Each component holds a token narrowed to one scope, so the client claims need their union.
        getPPRVisitorAuthClaims(routeParams),
    ]);
    // The layout resolves context from the same page params as PPRPageBody, so it shares its
    // cache scope and its data entries rather than adding a fourth set of fetches.
    const { context } = await getPPRStaticSiteContext(pageParams, 'body');
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
    const { context } = await getPPRStaticSiteContext(
        await getPPRPageRouteParams(await params),
        'body'
    );
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SitePPRLayoutProps) {
    const { context } = await getPPRStaticSiteContext(
        await getPPRPageRouteParams(await params),
        'body'
    );
    return generateSiteLayoutMetadata(context);
}
