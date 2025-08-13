import type { GitBookSiteContext } from '@/lib/context';
import {
    CustomizationAIMode,
    CustomizationHeaderPreset,
    CustomizationSearchStyle,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { Header, HeaderLogo } from '@/components/Header';
import { TableOfContents } from '@/components/TableOfContents';
import { CONTAINER_STYLE } from '@/components/layout';
import { tcls } from '@/lib/tailwind';

import type { VisitorAuthClaims } from '@/lib/adaptive';
import { GITBOOK_API_PUBLIC_URL, GITBOOK_APP_URL } from '@/lib/env';
import { AIChat } from '../AIChat';
import { AIChatButton } from '../AIChat';
import { Announcement } from '../Announcement';
import { SpacesDropdown } from '../Header/SpacesDropdown';
import { InsightsProvider } from '../Insights';
import { SearchContainer } from '../Search';
import { SiteSectionList, encodeClientSiteSections } from '../SiteSections';
import { CurrentContentProvider } from '../hooks';
import { SpaceLayoutContextProvider } from './SpaceLayoutContext';

/**
 * Render the entire layout of the space (header, table of contents, footer).
 */
export function SpaceLayout(props: {
    context: GitBookSiteContext;

    /** Whether to enable tracking of events into site insights. */
    withTracking: boolean;

    /** The visitor auth claims. */
    visitorAuthClaims: VisitorAuthClaims;

    /** The children of the layout. */
    children: React.ReactNode;
}) {
    const { context, withTracking, visitorAuthClaims, children } = props;
    const { siteSpace, customization, sections, siteSpaces } = context;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const withSections = Boolean(sections && sections.list.length > 1);
    const isMultiVariants = Boolean(siteSpaces.length > 1);

    const withFooter =
        customization.themes.toggeable ||
        customization.footer.copyright ||
        customization.footer.logo ||
        customization.footer.groups?.length;

    const aiMode = customization.ai?.mode;

    const searchAndAI = (
        <div className="flex grow items-center gap-2">
            <React.Suspense fallback={null}>
                <SearchContainer
                    aiMode={aiMode}
                    isMultiVariants={siteSpaces.length > 1}
                    spaceTitle={siteSpace.title}
                    siteSpaceId={siteSpace.id}
                />
            </React.Suspense>
            {aiMode === CustomizationAIMode.Assistant ? (
                <AIChatButton
                    withLabel={
                        withTopHeader &&
                        customization.styling.search === CustomizationSearchStyle.Prominent
                    }
                    trademark={customization.trademark.enabled}
                />
            ) : null}
        </div>
    );

    return (
        <SpaceLayoutContextProvider basePath={context.linker.toPathInSpace('')}>
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
                <InsightsProvider
                    enabled={withTracking}
                    appURL={GITBOOK_APP_URL}
                    apiHost={GITBOOK_API_PUBLIC_URL}
                    visitorCookieTrackingEnabled={customization.insights?.trackingCookie}
                >
                    <Announcement context={context} />
                    <Header withTopHeader={withTopHeader} context={context} search={searchAndAI} />
                    {aiMode === CustomizationAIMode.Assistant ? (
                        <AIChat trademark={customization.trademark.enabled} />
                    ) : null}
                    <div className="scroll-nojump">
                        <div className="motion-safe:transition-all motion-safe:duration-300 lg:chat-open:mr-80 xl:chat-open:mr-96">
                            <div
                                className={tcls(
                                    'flex',
                                    'flex-col',
                                    'lg:flex-row',
                                    CONTAINER_STYLE,
                                    'site-width-wide:max-w-full',

                                    // Ensure the footer is display below the viewport even if the content is not enough
                                    withFooter && 'min-h-[calc(100vh-64px)]',
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
                                                    'md:flex',
                                                    'grow-0',
                                                    'flex-wrap',
                                                    'dark:shadow-light/1',
                                                    'text-base/tight'
                                                )}
                                            >
                                                <HeaderLogo context={context} />
                                            </div>
                                        )
                                    }
                                    innerHeader={
                                        // displays the search button and/or the space dropdown in the ToC according to the header/variant settings. E.g if there is no header, the search button will be displayed in the ToC.
                                        <>
                                            {!withTopHeader && searchAndAI}
                                            {!withTopHeader && withSections && sections && (
                                                <SiteSectionList
                                                    className={tcls('hidden', 'lg:block')}
                                                    sections={encodeClientSiteSections(
                                                        context,
                                                        sections
                                                    )}
                                                />
                                            )}
                                            {isMultiVariants && !sections && (
                                                <SpacesDropdown
                                                    context={context}
                                                    siteSpace={siteSpace}
                                                    siteSpaces={siteSpaces}
                                                    className={tcls(
                                                        'w-full',
                                                        'page-no-toc:hidden',
                                                        'page-no-toc:site-header-none:flex'
                                                    )}
                                                />
                                            )}
                                        </>
                                    }
                                />
                                <div className="flex min-w-0 flex-1 flex-col">{children}</div>
                            </div>
                        </div>
                    </div>

                    {withFooter ? <Footer context={context} /> : null}
                </InsightsProvider>
            </CurrentContentProvider>
        </SpaceLayoutContextProvider>
    );
}
