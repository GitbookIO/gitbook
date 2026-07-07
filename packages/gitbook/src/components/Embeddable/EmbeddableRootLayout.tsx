import { CustomizationRootLayout } from '@/components/RootLayout';
import {
    SiteLayoutClientContexts,
    generateSiteLayoutMetadata,
    generateSiteLayoutViewport,
} from '@/components/SiteLayout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import type { GitBookSiteContext } from '@/lib/context';
import { resolveEmbeddableTheme } from '@/lib/embeddable';
import type { CustomizationDefaultThemeMode } from '@gitbook/api';
import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import { SpaceLayoutServerContext } from '../SpaceLayout';
import { Trademark } from '../TableOfContents/Trademark';
import { NavigationLoader } from '../primitives/NavigationLoader';
import { EmbeddableAIContextProvider } from './EmbeddableAIContextProvider';
import { EmbeddableIframeAPI } from './EmbeddableIframeAPI';
import { IfEmbeddableTrademark } from './EmbeddableTrademark';

type EmbeddableRootLayoutProps = {
    context: GitBookSiteContext;
    withTracking: boolean;
    visitorAuthClaims: VisitorAuthClaims;
    forcedTheme?: CustomizationDefaultThemeMode | null;
};

/**
 * Layout component for the embed routes.
 */
export async function EmbeddableRootLayout({
    context,
    withTracking,
    visitorAuthClaims,
    forcedTheme,
    children,
}: React.PropsWithChildren<EmbeddableRootLayoutProps>) {
    const theme = resolveEmbeddableTheme(context.customization, forcedTheme);

    return (
        <CustomizationRootLayout
            context={context}
            htmlClassName="embed"
            forcedTheme={theme.htmlTheme}
        >
            <SiteLayoutClientContexts
                forcedTheme={theme.forcedTheme}
                defaultTheme={theme.defaultTheme}
                // Keep embed theme separate from site so it does not reuse the full site's saved theme and vice versa.
                themeStorageKey={`gitbook-theme-embed:${context.site.id}`}
                externalLinksTarget={context.customization.externalLinks.target}
                contextId={context.contextId}
                proxyOrigin={context.site.proxy?.origin}
            >
                <EmbeddableAIContextProvider
                    aiMode={context.customization.ai.mode}
                    suggestions={context.customization.ai.suggestions}
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
                                <IfEmbeddableTrademark>
                                    <Trademark
                                        className="rounded-none! border-x-0 border-t border-b-0 bg-tint-solid/1 depth-flat:bg-tint-solid/1 px-4 py-2.5 text-tint/8"
                                        context={context}
                                        placement={SiteInsightsTrademarkPlacement.Embed}
                                    />
                                </IfEmbeddableTrademark>
                            ) : null}
                        </div>
                        <EmbeddableIframeAPI
                            baseURL={context.linker.toPathInSite('~gitbook/embed/')}
                        />
                    </SpaceLayoutServerContext>
                </EmbeddableAIContextProvider>
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
