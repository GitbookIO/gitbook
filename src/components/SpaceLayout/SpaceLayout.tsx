import {
    Collection,
    CustomizationHeaderPreset,
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Space,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { CompactHeader, Header } from '@/components/Header';
import { CONTAINER_STYLE } from '@/components/layout';
import { ColorDebugger } from '@/components/primitives/ColorDebugger';
import { SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { ContentPointer } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceLayout(props: {
    content: ContentPointer;
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    customization: CustomizationSettings;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    children: React.ReactNode;
}) {
    const {
        space,
        collection,
        collectionSpaces,
        content,
        pages,
        customization,
        ancestors,
        children,
    } = props;

    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;

    const contentRefContext: ContentRefContext = {
        space,
        pages,
        content,
    };

    return (
        <div>
            {/* <ColorDebugger /> */}
            <Header
                withTopHeader={withTopHeader}
                space={space}
                collection={collection}
                collectionSpaces={collectionSpaces}
                context={contentRefContext}
                customization={customization}
            />

            <div className={tcls('flex', 'flex-col', 'lg:flex-row', CONTAINER_STYLE)}>
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
                                collection={collection}
                                collectionSpaces={collectionSpaces}
                                customization={customization}
                            />
                        )
                    }
                    withHeaderOffset={withTopHeader}
                    visibleOnDesktop={true /*!!page.layout.tableOfContents */}
                />
                <div className={tcls('flex-1', 'flex', 'flex-col')}>{children}</div>
            </div>

            {customization.themes.toggeable ||
            customization.footer.copyright ||
            customization.footer.logo ||
            customization.footer.groups?.length ? (
                <Footer space={space} context={contentRefContext} customization={customization} />
            ) : null}

            <React.Suspense fallback={null}>
                <SearchModal
                    spaceId={space.id}
                    spaceTitle={customization.title ?? space.title}
                    withAsk={customization.aiSearch.enabled}
                    collectionId={collection && collectionSpaces.length > 1 ? collection.id : null}
                />
            </React.Suspense>
        </div>
    );
}
