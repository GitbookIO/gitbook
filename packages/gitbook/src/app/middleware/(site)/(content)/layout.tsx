import { getThemeFromMiddleware } from '@v2/lib/middleware';
import { Metadata, Viewport } from 'next';
import React from 'react';

import {
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
    SiteLayout,
} from '@/components/SiteLayout';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { shouldTrackEvents } from '@/lib/tracking';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const nonce = await getContentSecurityPolicyNonce();
    const context = await fetchLayoutData();
    const queryStringTheme = await getThemeFromMiddleware();

    return (
        <SiteLayout
            context={context}
            nonce={nonce}
            forcedTheme={queryStringTheme}
            withTracking={await shouldTrackEvents()}
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