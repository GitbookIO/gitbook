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

import { SpacesDropdown } from '../Header/SpacesDropdown';

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
    const withVariants = Boolean(site && spaces.length > 1);
    const headerOffset = { sectionsHeader: withSections, topHeader: withTopHeader };

    return (
        <>
            {/* <ColorDebugger /> */}
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
                                <CompactHeader
                                    space={space}
                                    site={site}
                                    spaces={spaces}
                                    customization={customization}
                                />
                            )
                        }
                        innerHeader={
                            sections || (!withTopHeader && withVariants) ? (
                                <SpacesDropdown space={space} spaces={spaces} />
                            ) : null
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
