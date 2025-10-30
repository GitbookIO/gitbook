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
import { languages } from '@/intl/translations';
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

function getSpaceVariants(context: GitBookSiteContext) {
    const { siteSpace, siteSpaces } = context;
    const currentLanguage = siteSpace.space.language;

    // Get all languages of the variants.
    const variantLanguages = [...new Set(siteSpaces.map((space) => space.space.language))];

    // We only show the language picker if there are at least 2 distinct languages, excluding undefined.
    const isMultiLanguage =
        variantLanguages.filter((language) => language !== undefined).length > 1;

    // Generic variants are all spaces that have the same language as the current (can also be undefined).
    const genericVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || space.space.language === currentLanguage
          )
        : siteSpaces;

    // Translation variants are all spaces that have a different language than the current.
    let translationVariants = isMultiLanguage
        ? siteSpaces.filter(
              (space) => space === siteSpace || space.space.language !== currentLanguage
          )
        : [];

    // If there is exactly 1 variant per language, we will use them as-is.
    // Otherwise, we will create a translation dropdown with the first space of each language.
    if (variantLanguages.length !== translationVariants.length) {
        translationVariants = variantLanguages
            // Get the first space of each language.
            .map((variantLanguage) =>
                translationVariants.find((space) => space.space.language === variantLanguage)
            )
            // Filter out unmatched languages.
            .filter((space) => space !== undefined)
            // Transform the title to include the language name if we have a translation. Otherwise, use the original title.
            .map((space) => {
                const language = languages[space.space.language as keyof typeof languages];
                return {
                    ...space,
                    title: language ? language.language : space.title,
                };
            });
    }

    return {
        generic: genericVariants,
        translations: translationVariants,
    };
}

/**
 * Render the entire layout of the space (header, table of contents, footer).
 */
export function SpaceLayout(props: SpaceLayoutProps) {
    const { context, children } = props;
    const { siteSpace, customization, sections, siteSpaces } = context;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const withSections = Boolean(sections && sections.list.length > 1);
    const variants = getSpaceVariants(context);

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
                            )
                        }
                        innerHeader={
                            // displays the search button and/or the space dropdown in the ToC according to the header/variant settings. E.g if there is no header, the search button will be displayed in the ToC.
                            <>
                                {!withTopHeader && (
                                    <div className="flex gap-2">
                                        <SearchContainer
                                            style={CustomizationSearchStyle.Subtle}
                                            withVariants={variants.generic.length > 1}
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
                                {variants.generic.length > 1 ? (
                                    <SpacesDropdown
                                        context={context}
                                        siteSpace={siteSpace}
                                        siteSpaces={variants.generic}
                                        className="w-full px-3 py-2"
                                    />
                                ) : null}
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
