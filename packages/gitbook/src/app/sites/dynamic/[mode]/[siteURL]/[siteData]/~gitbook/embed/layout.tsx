import { type RouteLayoutParams, getSiteURLDataFromParams } from '@/app/utils';
import {
    EmbeddableRootLayout,
    generateEmbeddableMetadata,
    generateEmbeddableViewport,
} from '@/components/Embeddable';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import { shouldTrackEvents } from '@/lib/tracking';
import { headers } from 'next/headers';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function RootLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const resolvedParams = await params;
    const { context, visitorAuthClaims } = await getEmbeddableStaticContext(resolvedParams);
    const withTracking = shouldTrackEvents(await headers());
    // The forced theme (`?theme=`) comes through the route context (set by the middleware), not a
    // request header, so the embed can honor it while staying statically rendered. RND-11571
    const forcedTheme = getSiteURLDataFromParams(resolvedParams).embedTheme ?? null;

    return (
        <EmbeddableRootLayout
            context={context}
            withTracking={withTracking}
            visitorAuthClaims={visitorAuthClaims}
            forcedTheme={forcedTheme}
        >
            {children}
        </EmbeddableRootLayout>
    );
}

export async function generateViewport({ params }: SiteStaticLayoutProps) {
    const { context } = await getEmbeddableStaticContext(await params);
    return generateEmbeddableViewport({ context });
}

export async function generateMetadata({ params }: SiteStaticLayoutProps) {
    const { context } = await getEmbeddableStaticContext(await params);
    return generateEmbeddableMetadata({ context });
}
