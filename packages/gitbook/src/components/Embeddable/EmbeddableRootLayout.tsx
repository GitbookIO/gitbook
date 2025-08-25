import { AIChatProvider, AIContextProvider } from '@/components/AI';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayoutClientContexts,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationAIMode } from '@gitbook/api';
import { EmbeddableIframeAPI } from './EmbeddableIframeAPI';

type EmbeddableRootLayoutProps = {
    context: GitBookSiteContext;
};

/**
 * Layout component for the embed routes.
 */
export async function EmbeddableRootLayout({
    context,
    children,
}: React.PropsWithChildren<EmbeddableRootLayoutProps>) {
    return (
        <CustomizationRootLayout customization={context.customization}>
            <SiteLayoutClientContexts
                forcedTheme={context.customization.themes.default}
                externalLinksTarget={context.customization.externalLinks.target}
                contextId={context.contextId}
            >
                <AIContextProvider
                    aiMode={CustomizationAIMode.Assistant}
                    trademark={context.customization.trademark.enabled}
                >
                    <AIChatProvider
                        renderMessageOptions={{
                            withLinkPreviews: false,
                            asEmbeddable: true,
                        }}
                    >
                        <div className="fixed inset-0 flex flex-col">{children}</div>
                        <EmbeddableIframeAPI />
                    </AIChatProvider>
                </AIContextProvider>
            </SiteLayoutClientContexts>
        </CustomizationRootLayout>
    );
}

export async function generateEmbeddableViewport({ context }: EmbeddableRootLayoutProps) {
    return generateSiteLayoutViewport(context);
}

export async function generateEmbeddableMetadata({ context }: EmbeddableRootLayoutProps) {
    return generateSiteLayoutMetadata(context);
}
