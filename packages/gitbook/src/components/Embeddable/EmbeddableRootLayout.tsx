import { AIContextProvider } from '@/components/AI';
import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayoutClientContexts,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import { SpaceLayoutServerContext } from '../SpaceLayout';
import { TrademarkLink } from '../TableOfContents/Trademark';
import { NavigationLoader } from '../primitives/NavigationLoader';
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
                forcedTheme={
                    context.customization.themes.toggeable
                        ? undefined
                        : context.customization.themes.default
                }
                externalLinksTarget={context.customization.externalLinks.target}
                contextId={context.contextId}
            >
                <AIContextProvider
                    aiMode={context.customization.ai.mode}
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
                        <NavigationLoader />
                        <div className="fixed inset-0 flex flex-col">
                            {children}
                            {context.customization.trademark.enabled ? (
                                <TrademarkLink
                                    className="rounded-none border-tint-solid/3 border-t bg-tint-solid/1 px-4 py-2.5 text-tint/8 ring-0"
                                    context={context}
                                    placement={SiteInsightsTrademarkPlacement.Embed}
                                />
                            ) : null}
                        </div>
                        <EmbeddableIframeAPI
                            baseURL={context.linker.toPathInSite('~gitbook/embed/')}
                            siteTitle={context.site.title}
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
