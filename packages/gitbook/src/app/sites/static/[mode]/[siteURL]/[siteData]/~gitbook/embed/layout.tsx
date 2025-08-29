import type { RouteLayoutParams } from '@/app/utils';
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
    const { context, visitorAuthClaims } = await getEmbeddableStaticContext(await params);
    const withTracking = shouldTrackEvents();

    return (
        <EmbeddableRootLayout
            context={context}
            withTracking={withTracking}
            visitorAuthClaims={visitorAuthClaims}
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
