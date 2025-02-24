import {
    CustomizationHeaderPreset,
    CustomizationSidebarBackgroundStyle,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { Header, HeaderLogo } from '@/components/Header';
import { CONTAINER_STYLE } from '@/components/layout';
import { SearchButton, SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { api } from '@/lib/api';
import { tcls } from '@/lib/tailwind';
import { shouldTrackEvents } from '@/lib/tracking';
import { getSitePointerFromContext } from '@/lib/v1';
import { getCurrentVisitorToken } from '@/lib/visitor-token';

import { SpacesDropdown } from '../Header/SpacesDropdown';
import { InsightsProvider } from '../Insights';
import { SiteSectionList } from '../SiteSections';
import { GitBookSiteContext } from '@v2/lib/context';

/**
 * Render the entire layout of the space (header, table of contents, footer).
 */
export async function SpaceLayout(props: {
    context: GitBookSiteContext;
    children: React.ReactNode;
}) {
    const {
        context,
        children,
    } = props;
    const { space, customization, pages, site, sections, spaces } = context;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const withSections = Boolean(sections && sections.list.length > 0);
    const withVariants = Boolean(site && spaces.length > 1);
    const headerOffset = {
        sectionsHeader: withSections,
        topHeader: withTopHeader,
        sidebarBackgroundFilled:
            'sidebar' in customization.styling &&
            customization.styling.sidebar.background === CustomizationSidebarBackgroundStyle.Filled,
    };
    const apiHost = (await api()).client.endpoint;
    const visitorAuthToken = await getCurrentVisitorToken();
    const enabled = await shouldTrackEvents();

    const withFooter =
        customization.themes.toggeable ||
        customization.footer.copyright ||
        customization.footer.logo ||
        customization.footer.groups?.length;

    return (
        <InsightsProvider
            enabled={enabled}
            apiHost={apiHost}
            visitorAuthToken={visitorAuthToken}
            {...getSitePointerFromContext(context)}
        >
            <Header
                withTopHeader={withTopHeader}
                context={context}
                space={space}
                site={site}
                spaces={spaces}
                sections={sections}
                customization={customization}
            />
            <div
                className={tcls(
                    'flex',
                    'flex-col',
                    'lg:flex-row',
                    CONTAINER_STYLE,

                    // Ensure the footer is display below the viewport even if the content is not enough
                    withFooter && 'min-h-[calc(100vh-64px)]',
                    withTopHeader ? null : 'lg:min-h-screen',
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
                                    'flex-wrap',
                                    'dark:shadow-light/1',
                                )}
                            >
                                <HeaderLogo
                                    site={site}
                                    space={space}
                                    customization={customization}
                                />
                            </div>
                        )
                    }
                    innerHeader={
                        // displays the search button and/or the space dropdown in the ToC according to the header/variant settings. E.g if there is no header, the search button will be displayed in the ToC.
                        <>
                            {!withTopHeader && (
                                <div className={tcls('hidden', 'lg:block')}>
                                    <React.Suspense fallback={null}>
                                        <SearchButton>
                                            <span className={tcls('flex-1')}>
                                                {t(
                                                    getSpaceLanguage(customization),
                                                    customization.aiSearch.enabled
                                                        ? 'search_or_ask'
                                                        : 'search',
                                                )}
                                            </span>
                                        </SearchButton>
                                    </React.Suspense>
                                </div>
                            )}
                            {!withTopHeader && withSections && sections && (
                                <SiteSectionList
                                    className={tcls('hidden', 'lg:block')}
                                    sections={sections}
                                />
                            )}
                            {withVariants && (
                                <SpacesDropdown
                                    space={space}
                                    spaces={spaces}
                                    className={tcls('w-full')}
                                />
                            )}
                        </>
                    }
                    headerOffset={headerOffset}
                />
                <div className={tcls('flex-1', 'flex', 'flex-col')}>{children}</div>
            </div>

            {withFooter ? (
                <Footer context={context} />
            ) : null}

            <React.Suspense fallback={null}>
                <SearchModal
                    revisionId={context.revisionId}
                    spaceTitle={customization.title ?? space.title}
                    withAsk={customization.aiSearch.enabled}
                    isMultiVariants={Boolean(site && spaces.length > 1)}
                    pointer={getSitePointerFromContext(context)}
                />
            </React.Suspense>
        </InsightsProvider>
    );
}
