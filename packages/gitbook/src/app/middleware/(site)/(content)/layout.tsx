import { getThemeFromMiddleware, getVisitorAuthTokenFromMiddleware } from '@v2/lib/middleware';
import type { Metadata, Viewport } from 'next';
import type React from 'react';

import {
    SiteLayout,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { getSiteContentPointer } from '@/lib/pointer';
import { shouldTrackEvents } from '@/lib/tracking';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const context = await fetchLayoutData();
    const queryStringTheme = await getThemeFromMiddleware();
    const visitorAuthToken = await getVisitorAuthTokenFromMiddleware();

    return (
        <SiteLayout
            context={context}
            forcedTheme={queryStringTheme}
            withTracking={await shouldTrackEvents()}
            visitorAuthToken={visitorAuthToken}
        >
            {children}
        </SiteLayout>
    );
}

export async function generateViewport(): Promise<Viewport> {
    const context = await fetchLayoutData();
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata(): Promise<Metadata> {
    const context = await fetchLayoutData();
    return generateSiteLayoutMetadata(context);
}

async function fetchLayoutData() {
    const pointer = await getSiteContentPointer();
    return fetchV1ContextForSitePointer(pointer);
}
