import {
    Collection,
    CustomizationHeaderPreset,
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Site,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { CompactHeader, Header } from '@/components/Header';
import { CONTAINER_STYLE } from '@/components/layout';
import { ColorDebugger } from '@/components/primitives/ColorDebugger';
import { SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { ContentPointer, ContentTarget } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceLayout(props: {
    content: ContentPointer;
    contentTarget: ContentTarget;
    space: Space;
    parent: Site | Collection | null;
    spaces: Space[];
    customization: CustomizationSettings | SiteCustomizationSettings;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    children: React.ReactNode;
}) {
    const {
        space,
        contentTarget,
        parent,
        spaces,
        content,
        pages,
        customization,
        ancestors,
        children,
    } = props;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const contentRefContext: ContentRefContext = {
        space,
        revisionId: contentTarget.revisionId,
        pages,
    };

    return (
        <>
            {/* <ColorDebugger /> */}
            <Header
                withTopHeader={withTopHeader}
                space={space}
                parent={parent}
                spaces={spaces}
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
                                    parent={parent}
                                    spaces={spaces}
                                    customization={customization}
                                />
                            )
                        }
                        withHeaderOffset={withTopHeader}
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
                    parent={parent && spaces.length > 1 ? parent : null}
                />
            </React.Suspense>
        </>
    );
}
