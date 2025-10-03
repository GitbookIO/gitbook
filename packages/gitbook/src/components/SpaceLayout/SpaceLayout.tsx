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
import { tcls } from '@/lib/tailwind';

import { getSpaceLanguage } from '@/intl/server';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import { GITBOOK_APP_URL } from '@/lib/env';
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
    const { siteSpace, customization, sections, siteSpaces } = context;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const withSections = Boolean(sections && sections.list.length > 1);

    const currentLanguage = getSpaceLanguage(context);
    const withVariants: 'generic' | 'translations' | undefined =
        siteSpaces.length > 1
            ? siteSpaces.some(
                  (space) => space.space.language && space.space.language !== currentLanguage.locale
              )
                ? 'translations'
                : 'generic'
            : undefined;

    const withFooter =
        customization.themes.toggeable ||
        customization.footer.copyright ||
        customization.footer.logo ||
        customization.footer.groups?.length;

    return (
        <SpaceLayoutServerContext {...props}>
            <Announcement context={context} />
            <Header withTopHeader={withTopHeader} withVariants={withVariants} context={context} />
            <NavigationLoader />
            {customization.ai?.mode === CustomizationAIMode.Assistant ? (
                <AIChat trademark={customization.trademark.enabled} />
            ) : null}

            <div className="motion-safe:transition-all motion-safe:duration-300 lg:chat-open:mr-80 xl:chat-open:mr-96">
                <div
                    className={tcls(
                        'flex',
                        'flex-col',
                        'lg:flex-row',
                        'lg:justify-center',
                        CONTAINER_STYLE,
                        'site-width-wide:max-w-full',

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
                            withTopHeader ? null : (
                                <div
                                    className={tcls(
                                        'hidden',
                                        'pr-4',
                                        'lg:flex',
                                        'grow-0',
                                        'dark:shadow-light/1',
                                        'text-base/tight',
                                        'items-center'
                                    )}
                                >
                                    <HeaderLogo context={context} />
                                    {withVariants === 'translations' ? (
                                        <TranslationsDropdown
                                            context={context}
                                            siteSpace={siteSpace}
                                            siteSpaces={siteSpaces}
                                            className="[&_.button-leading-icon]:block! ml-auto py-2 [&_.button-content]:hidden"
                                        />
                                    ) : null}
                                </div>
                            )
                        }
                        innerHeader={
                            // displays the search button and/or the space dropdown in the ToC according to the header/variant settings. E.g if there is no header, the search button will be displayed in the ToC.
                            <>
                                {!withTopHeader && (
                                    <div className="flex gap-2">
                                        <SearchContainer
                                            style={CustomizationSearchStyle.Subtle}
                                            withVariants={withVariants === 'generic'}
                                            withSiteVariants={
                                                sections?.list.some(
                                                    (s) =>
                                                        s.object === 'site-section' &&
                                                        s.siteSpaces.length > 1
                                                ) ?? false
                                            }
                                            withSections={withSections}
                                            section={sections?.current}
                                            spaceTitle={siteSpace.title}
                                            siteSpaceId={siteSpace.id}
                                            siteSpaceIds={siteSpaces
                                                .filter(
                                                    (s) =>
                                                        s.space.language ===
                                                        siteSpace.space.language
                                                )
                                                .map((s) => s.id)}
                                            className="max-lg:hidden"
                                            viewport="desktop"
                                        />
                                    </div>
                                )}
                                {!withTopHeader && withSections && sections && (
                                    <SiteSectionList
                                        className={tcls('hidden', 'lg:block')}
                                        sections={encodeClientSiteSections(context, sections)}
                                    />
                                )}
                                {withVariants === 'generic' && (
                                    <SpacesDropdown
                                        context={context}
                                        siteSpace={siteSpace}
                                        siteSpaces={siteSpaces}
                                        className="w-full px-3 py-2"
                                    />
                                )}
                            </>
                        }
                    />
                    {children}
                </div>
            </div>

            {withFooter ? <Footer context={context} /> : null}
        </SpaceLayoutServerContext>
    );
}
