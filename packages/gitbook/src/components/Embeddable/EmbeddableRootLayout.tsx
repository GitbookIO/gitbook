import { AIContextProvider } from '@/components/AI';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayoutClientContexts,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationAIMode } from '@gitbook/api';
import { SpaceLayoutServerContext } from '../SpaceLayout';
import { EmbeddableIframeAPI } from './EmbeddableIframeAPI';

type EmbeddableRootLayoutProps = {
    context: GitBookSiteContext;
    withTracking: boolean;
    visitorAuthClaims: VisitorAuthClaims;
};

/**
 * Layout component for the embed routes.
 */
export async function EmbeddableRootLayout({
    context,
    withTracking,
    visitorAuthClaims,
    children,
}: React.PropsWithChildren<EmbeddableRootLayoutProps>) {
    return (
        <CustomizationRootLayout context={context}>
            <SiteLayoutClientContexts
                forcedTheme={context.customization.themes.default}
                externalLinksTarget={context.customization.externalLinks.target}
                contextId={context.contextId}
            >
                <AIContextProvider
                    aiMode={CustomizationAIMode.Assistant}
                    trademark={context.customization.trademark.enabled}
                >
                    <SpaceLayoutServerContext
                        context={context}
                        withTracking={withTracking}
                        visitorAuthClaims={visitorAuthClaims}
                        aiChatRenderMessageOptions={{
                            withLinkPreviews: false,
                            asEmbeddable: true,
                        }}
                    >
                        <div className="fixed inset-0 flex flex-col">{children}</div>
                        <EmbeddableIframeAPI
                            baseURL={context.linker.toPathInSpace('~gitbook/embed/')}
                        />
                    </SpaceLayoutServerContext>
                </AIContextProvider>
            </SiteLayoutClientContexts>
        </CustomizationRootLayout>
    );
}

export async function generateEmbeddableViewport({ context }: { context: GitBookSiteContext }) {
    return generateSiteLayoutViewport(context);
}

export async function generateEmbeddableMetadata({ context }: { context: GitBookSiteContext }) {
    return generateSiteLayoutMetadata(context);
}
