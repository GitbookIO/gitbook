import type { GitBookSiteContext } from '@/lib/context';
import {
    CustomizationAIMode,
    CustomizationHeaderPreset,
    CustomizationSearchStyle,
} from '@gitbook/api';
import type React from 'react';

import { Footer } from '@/components/Footer';
import { Header, HeaderLogo } from '@/components/Header';
import { TableOfContents } from '@/components/TableOfContents';
import { CONTAINER_STYLE } from '@/components/layout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import { GITBOOK_APP_URL } from '@/lib/env';
import { tcls } from '@/lib/tailwind';
import { AIChatProvider } from '../AI';
import type { RenderAIMessageOptions } from '../AI';
import { AIChat } from '../AIChat';
import { AdaptiveVisitorContextProvider } from '../Adaptive';
import { Announcement } from '../Announcement';
import { SpacesDropdown, TranslationsDropdown } from '../Header/SpacesDropdown';
import { InsightsProvider, VisitorSessionProvider } from '../Insights';
import { SearchContainer } from '../Search';
import { SiteSectionList, encodeClientSiteSections } from '../SiteSections';
import { CurrentContentProvider } from '../hooks';
import { NavigationLoader } from '../primitives/NavigationLoader';
import { SpaceLayoutContextProvider } from './SpaceLayoutContext';
import { categorizeVariants } from './categorizeVariants';

type SpaceLayoutProps = {
    context: GitBookSiteContext;

    /** Whether to enable tracking of events into site insights. */
    withTracking: boolean;

    /** The visitor auth claims. */
    visitorAuthClaims: VisitorAuthClaims;

    /** The options for rendering AI messages. */
    aiChatRenderMessageOptions?: RenderAIMessageOptions;

    /** The children of the layout. */
    children: React.ReactNode;
};

/**
 * Provide all contexts for a space.
 */
export function SpaceLayoutServerContext(props: SpaceLayoutProps) {
    const { context, withTracking, visitorAuthClaims, aiChatRenderMessageOptions, children } =
        props;

    const { customization } = context;

    const eventUrl = new URL(
        context.linker.toAbsoluteURL(context.linker.toPathInSite('/~gitbook/__evt'))
    );
    eventUrl.searchParams.set('o', context.organizationId);
    eventUrl.searchParams.set('s', context.site.id);

    const getVisitorClaimsUrl = context.linker.toAbsoluteURL(
        context.linker.toPathInSite('/~gitbook/visitor')
    );

    return (
        <SpaceLayoutContextProvider basePath={context.linker.toPathInSpace('')}>
            <AdaptiveVisitorContextProvider
                contextId={context.contextId}
                visitorClaimsURL={getVisitorClaimsUrl}
            >
                <CurrentContentProvider
                    organizationId={context.organizationId}
                    siteId={context.site.id}
                    siteSectionId={context.sections?.current?.id ?? null}
                    siteSpaceId={context.siteSpace.id}
                    siteShareKey={context.shareKey ?? null}
                    spaceId={context.space.id}
                    revisionId={context.revisionId}
                    visitorAuthClaims={visitorAuthClaims}
                >
                    <VisitorSessionProvider
                        appURL={GITBOOK_APP_URL}
                        visitorCookieTrackingEnabled={customization.insights?.trackingCookie}
                    >
                        <InsightsProvider enabled={withTracking} eventUrl={eventUrl.toString()}>
                            <AIChatProvider renderMessageOptions={aiChatRenderMessageOptions}>
                                {children}
                            </AIChatProvider>
                        </InsightsProvider>
                    </VisitorSessionProvider>
                </CurrentContentProvider>
            </AdaptiveVisitorContextProvider>
        </SpaceLayoutContextProvider>
    );
}

/**
 * Render the entire layout of the space (header, table of contents, footer).
 */
export function SpaceLayout(props: SpaceLayoutProps) {
    const { context, children } = props;
    const { siteSpace, customization, visibleSections, visibleSiteSpaces } = context;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const withSections = Boolean(visibleSections && visibleSections.list.length > 1);
    const variants = categorizeVariants(context);

    const withFooter =
        customization.themes.toggeable ||
        customization.footer.copyright ||
        customization.footer.logo ||
        customization.footer.groups?.length;

    return (
        <SpaceLayoutServerContext {...props}>
            <Announcement context={context} />
            <Header withTopHeader={withTopHeader} variants={variants} context={context} />
            <NavigationLoader />
            {customization.ai?.mode === CustomizationAIMode.Assistant ? <AIChat /> : null}

            <div className="motion-safe:transition-all motion-safe:duration-300 lg:chat-open:mr-80 xl:chat-open:mr-96">
                <div
                    className={tcls(
                        'flex',
                        'flex-col',
                        'lg:flex-row',
                        'lg:justify-center',
                        CONTAINER_STYLE,
                        'site-width-wide:max-w-screen-4xl',
                        'transition-[max-width] duration-300',

                        // Ensure the footer is display below the viewport even if the content is not enough
                        withFooter && [
                            'site-header:min-h-[calc(100vh-64px)]',
                            'site-header-sections:min-h-[calc(100vh-108px)]',
                        ],
                        withTopHeader ? null : 'lg:min-h-screen'
                    )}
                >
                    <TableOfContents
                        context={context}
                        header={
                            <div
                                className={tcls(
                                    'pr-4',
                                    'flex',
                                    withTopHeader ? 'lg:hidden' : '',
                                    'grow-0',
                                    'dark:shadow-light/1',
                                    'text-base/tight',
                                    'items-center'
                                )}
                            >
                                <HeaderLogo context={context} />
                                {variants.translations.length > 1 ? (
                                    <TranslationsDropdown
                                        context={context}
                                        siteSpace={
                                            variants.translations.find(
                                                (space) => space.id === siteSpace.id
                                            ) ?? siteSpace
                                        }
                                        siteSpaces={variants.translations}
                                        className="[&_.button-leading-icon]:block! ml-auto py-2 [&_.button-content]:hidden"
                                    />
                                ) : null}
                            </div>
                        }
                        // Displays the search button and/or the space dropdown in the ToC
                        // according to the header/variant settings.
                        // E.g if there is no header, the search button will be displayed in the ToC.
                        innerHeader={
                            !withTopHeader || variants.generic.length > 1 ? (
                                <div
                                    className={tcls(
                                        'my-5 sidebar-default:mt-2 flex flex-col gap-2 px-5 empty:hidden',
                                        variants.generic.length > 1 ? '' : 'max-lg:hidden'
                                    )}
                                >
                                    {!withTopHeader && (
                                        <div className="flex gap-2 max-lg:hidden">
                                            <SearchContainer
                                                style={CustomizationSearchStyle.Subtle}
                                                withVariants={variants.generic.length > 1}
                                                withSiteVariants={
                                                    visibleSections?.list.some(
                                                        (s) =>
                                                            s.object === 'site-section' &&
                                                            s.siteSpaces.length > 1
                                                    ) ?? false
                                                }
                                                withSections={withSections}
                                                section={visibleSections?.current}
                                                siteSpace={siteSpace}
                                                siteSpaces={visibleSiteSpaces}
                                                viewport="desktop"
                                            />
                                        </div>
                                    )}
                                    {!withTopHeader && withSections && visibleSections && (
                                        <SiteSectionList
                                            className="hidden lg:block"
                                            sections={encodeClientSiteSections(
                                                context,
                                                visibleSections
                                            )}
                                        />
                                    )}
                                    {variants.generic.length > 1 ? (
                                        <SpacesDropdown
                                            context={context}
                                            siteSpace={siteSpace}
                                            siteSpaces={variants.generic}
                                            className="w-full px-3"
                                        />
                                    ) : null}
                                </div>
                            ) : null
                        }
                    />
                    {children}
                </div>
            </div>

            {withFooter ? <Footer context={context} /> : null}
        </SpaceLayoutServerContext>
    );
}
