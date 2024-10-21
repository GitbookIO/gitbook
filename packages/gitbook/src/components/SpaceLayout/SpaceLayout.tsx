import {
    CustomizationHeaderPreset,
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Site,
    SiteCustomizationSettings,
    SiteSection,
    Space,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { CompactHeader, Header } from '@/components/Header';
import { CONTAINER_STYLE } from '@/components/layout';
import { ColorDebugger } from '@/components/primitives/ColorDebugger';
import { SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { ContentTarget, SiteContentPointer } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { SiteSectionTabs } from '../SiteSectionTabs';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceLayout(props: {
    content: SiteContentPointer;
    contentTarget: ContentTarget;
    space: Space;
    site: Site | null;
    sections: { list: SiteSection[]; section: SiteSection } | null;
    spaces: Space[];
    customization: CustomizationSettings | SiteCustomizationSettings;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    children: React.ReactNode;
}) {
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

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const contentRefContext: ContentRefContext = {
        siteContext: content,
        space,
        revisionId: contentTarget.revisionId,
        pages,
    };

    const withSections = Boolean(sections && sections.list.length > 0);
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    return (
        <>
            {/* <ColorDebugger /> */}
            <Header
                withTopHeader={withTopHeader}
                space={space}
                site={site}
                spaces={spaces}
                context={contentRefContext}
                customization={customization}
            >
                {sections ? (
                    <div
                        className={tcls(
                            'w-full shadow-thintop dark:shadow-light/1 bg-light dark:bg-dark z-[9] mt-0.5',
                        )}
                    >
                        <div className={tcls(CONTAINER_STYLE)}>
                            <SiteSectionTabs sections={sections.list} section={sections.section} />
                        </div>
                    </div>
                ) : null}
            </Header>
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
                                <CompactHeader
                                    space={space}
                                    site={site}
                                    spaces={spaces}
                                    customization={customization}
                                />
                            )
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
                    spaceId={contentTarget.spaceId}
                    revisionId={contentTarget.revisionId}
                    spaceTitle={customization.title ?? space.title}
                    withAsk={customization.aiSearch.enabled}
                    isMultiVariants={Boolean(site && spaces.length > 1)}
                    pointer={content}
                />
            </React.Suspense>
        </>
    );
}
