import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { CustomizationRootLayout } from '@/components/RootLayout';
import { generateSiteLayoutMetadata, generateSiteLayoutViewport } from '@/components/SiteLayout';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function EmbedAssistantRootLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const { context } = await getStaticSiteContext(await params);

    return (
        <CustomizationRootLayout customization={context.customization}>
            {children}
        </CustomizationRootLayout>
    );
}

export async function generateViewport({ params }: SiteStaticLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutViewport(context);
}

export async function generateMetadata({ params }: SiteStaticLayoutProps) {
    const { context } = await getStaticSiteContext(await params);
    return generateSiteLayoutMetadata(context);
}
