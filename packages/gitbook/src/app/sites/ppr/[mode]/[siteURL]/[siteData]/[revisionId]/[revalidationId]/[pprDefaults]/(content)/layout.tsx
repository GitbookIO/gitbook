import type React from 'react';

import {
    type PPRRouteLayoutParams,
    getPPRHeaderRouteParams,
    getPPRPageRouteParams,
    getPPRSiteRouteParams,
    getPPRStaticSiteContext,
    getPPRStaticSiteScopeContext,
    getPPRTableOfContentsRouteParams,
    getPPRVisitorAuthClaims,
} from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import {
    PPRAdminToolbar,
    PPRAnnouncement,
    PPRFooter,
    PPRHeader,
    PPRRevisionIconsProvider,
    PPRTableOfContents,
} from '@/components/SitePage/PPRSitePage';
import { shouldTrackEvents } from '@/lib/tracking';

interface SitePPRLayoutProps {
    params: Promise<PPRRouteLayoutParams>;
}

export default async function SitePPRLayout({
    params,
    children,
}: React.PropsWithChildren<SitePPRLayoutProps>) {
    const routeParams = await params;
    const [siteParams, headerParams, tableOfContentsParams, visitorAuthClaims] = await Promise.all([
        getPPRSiteRouteParams(routeParams),
        getPPRHeaderRouteParams(routeParams),
        getPPRTableOfContentsRouteParams(routeParams),
        // Each component holds a token narrowed to one scope, so the client claims need their union.
        getPPRVisitorAuthClaims(routeParams),
    ]);
    // The layout is rendered on every request, so it only resolves site-level data — under the
    // scope of the header, whose site fetch it then shares. Everything below the site level is
    // delegated to the cached components in the slots.
    const { context } = await getPPRStaticSiteScopeContext(siteParams, 'header');
    const withTracking = shouldTrackEvents();

    return (
        <CustomizationRootLayout
            htmlClassName="sheet-open:gutter-stable"
            bodyClassName="site-background"
            context={context}
        >
            <PPRRevisionIconsProvider params={tableOfContentsParams}>
                <SiteLayout
                    context={context}
                    withTracking={withTracking}
                    visitorAuthClaims={visitorAuthClaims}
                    slots={{
                        announcement: <PPRAnnouncement params={tableOfContentsParams} />,
                        header: <PPRHeader params={headerParams} />,
                        tableOfContents: <PPRTableOfContents params={tableOfContentsParams} />,
                        footer: <PPRFooter params={tableOfContentsParams} />,
                        adminToolbar: <PPRAdminToolbar params={tableOfContentsParams} />,
                    }}
                    // The header and table of contents are cached across pages, so the selection they
                    // were rendered with belongs to another page and has to be resolved on the client.
                    clientNavigationSelection
                >
                    {children}
                </SiteLayout>
            </PPRRevisionIconsProvider>
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
