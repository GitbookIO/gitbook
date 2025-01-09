import {
    CustomizationHeaderPreset,
    CustomizationSettings,
    CustomizationSidebarBackgroundStyle,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Site,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import { headers } from 'next/headers';
import React from 'react';

import { Footer } from '@/components/Footer';
import { Header, HeaderLogo } from '@/components/Header';
import { CONTAINER_STYLE } from '@/components/layout';
import { SearchButton, SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { api, ContentTarget, type SectionsList, SiteContentPointer } from '@/lib/api';
import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { shouldTrackEvents } from '@/lib/tracking';

import { SpacesDropdown } from '../Header/SpacesDropdown';
import { InsightsProvider } from '../Insights';
import { SiteSectionList } from '../SiteSections/SiteSectionList';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export async function SpaceLayout(props: {
    content: SiteContentPointer;
    contentTarget: ContentTarget;
    space: Space;
    site: Site | null;
    sections: SectionsList | null;
    spaces: Space[];
    customization: CustomizationSettings | SiteCustomizationSettings;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    children: React.ReactNode;
}) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const {
        space,
        contentTarget,
        site,
        sections,
        spaces,
        content,
        pages,
        customization,
        ancestors,
        children,
    } = props;

    const withTopHeader = false; //customization.header.preset !== CustomizationHeaderPreset.None;

    const contentRefContext: ContentRefContext = {
        siteContext: content,
        space,
        revisionId: contentTarget.revisionId,
        pages,
    };

    const withSections = Boolean(sections && sections.list.length > 0);
    const withVariants = Boolean(site && spaces.length > 1);
    const headerOffset = {
        sectionsHeader: withSections,
        topHeader: withTopHeader,
        sidebarBackgroundFilled:
            'sidebar' in customization.styling &&
            customization.styling.sidebar.background === CustomizationSidebarBackgroundStyle.Filled,
    };
    const apiHost = api(ctx).client.endpoint;
    const visitorAuthToken = ctx.visitorToken;
    const enabled = shouldTrackEvents(ctx);

    return (
        <InsightsProvider
            enabled={enabled}
            apiHost={apiHost}
            visitorAuthToken={visitorAuthToken}
            {...content}
        >
            <Header
                withTopHeader={withTopHeader}
                space={space}
                site={site}
                spaces={spaces}
                sections={sections}
                context={contentRefContext}
                customization={customization}
            />
            <div className={tcls('scroll-nojump')}>
                <div
                    className={tcls(
                        'flex',
                        'flex-col',
                        'lg:flex-row',
                        CONTAINER_STYLE,

                        // Ensure the footer is display below the viewport even if the content is not enough
                        `min-h-[calc(100vh-64px)]`,
                        withTopHeader ? null : 'lg:min-h-screen',
                    )}
                >
                    <TableOfContents
                        space={space}
                        customization={customization}
                        content={content}
                        pages={pages}
                        ancestors={ancestors}
                        context={contentRefContext}
                        header={
                            withTopHeader ? null : (
                                <div
                                    className={tcls(
                                        'hidden',
                                        'pr-4',
                                        'lg:flex',
                                        'flex-grow-0',
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
                                    <SiteSectionList {...sections} />
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
            </div>

            {customization.themes.toggeable ||
            customization.footer.copyright ||
            customization.footer.logo ||
            customization.footer.groups?.length ? (
                <Footer space={space} context={contentRefContext} customization={customization} />
            ) : null}

            <React.Suspense fallback={null}>
                <SearchModal
                    ctx={ctx}
                    spaceId={contentTarget.spaceId}
                    revisionId={contentTarget.revisionId}
                    spaceTitle={customization.title ?? space.title}
                    withAsk={customization.aiSearch.enabled}
                    isMultiVariants={Boolean(site && spaces.length > 1)}
                    pointer={content}
                />
            </React.Suspense>
        </InsightsProvider>
    );
}
