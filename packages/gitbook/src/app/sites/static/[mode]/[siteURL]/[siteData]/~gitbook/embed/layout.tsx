import { type RouteLayoutParams, getSiteURLDataFromParams } from '@/app/utils';
import {
    EmbeddableRootLayout,
    generateEmbeddableMetadata,
    generateEmbeddableViewport,
} from '@/components/Embeddable';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import { shouldTrackEvents } from '@/lib/tracking';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function RootLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const resolvedParams = await params;
    const { context, visitorAuthClaims } = await getEmbeddableStaticContext(resolvedParams);
    const withTracking = shouldTrackEvents();
    // The forced theme (`?theme=`) is threaded through the route context by the middleware so the
    // embed stays statically rendered — read it from the params rather than a request header. RND-11571
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
