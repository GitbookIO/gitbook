import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { AIChatDynamicIcon } from '@/components/AIChat';
import { EmbeddableFrame } from '@/components/Embeddable';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayoutClientContexts,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import { EmbedIframeAPI } from './EmbedIframeAPI';
import { getEmbedSiteContext } from './context';

interface SiteStaticLayoutProps {
    params: Promise<RouteLayoutParams>;
}

export default async function EmbedAssistantRootLayout({
    params,
    children,
}: React.PropsWithChildren<SiteStaticLayoutProps>) {
    const { context } = await getEmbedSiteContext(await params);

    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayoutClientContexts
                forcedTheme={context.customization.themes.default}
                externalLinksTarget={context.customization.externalLinks.target}
                contextId={context.contextId}
            >
                <EmbeddableFrame
                    icon={<AIChatDynamicIcon trademark={context.customization.trademark.enabled} />}
                    title="Test"
                    className="fixed inset-0"
                >
                    {children}
                </EmbeddableFrame>
                <EmbedIframeAPI />
            </SiteLayoutClientContexts>
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
