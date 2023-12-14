import {
    Collection,
    CustomizationHeaderPreset,
    CustomizationSettings,
    JSONDocument,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Space,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { CompactHeader, Header } from '@/components/Header';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';
import { PageBody, PageCover } from '@/components/PageBody';
import { SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { ContentPointer } from '@/lib/api';
import { hasFullWidthBlock } from '@/lib/document';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageAside } from '../PageAside';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceContent(props: {
    content: ContentPointer;
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    customization: CustomizationSettings;
    pages: Revision['pages'];
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    document: JSONDocument | null;
}) {
    const {
        space,
        collection,
        collectionSpaces,
        content,
        pages,
        customization,
        page,
        ancestors,
        document,
    } = props;

    const asFullWidth = document ? hasFullWidthBlock(document) : false;
    const withTopHeader = customization.header.preset !== CustomizationHeaderPreset.None;
    const withFullPageCover = !!(
        page.cover &&
        page.layout.cover &&
        page.layout.coverSize === 'full'
    );

    const contentRefContext: ContentRefContext = {
        space,
        pages,
        page,
        content,
    };

    return (
        <div>
            {withTopHeader ? (
                <Header
                    space={space}
                    collection={collection}
                    collectionSpaces={collectionSpaces}
                    context={contentRefContext}
                    customization={customization}
                    asFullWidth={asFullWidth}
                />
            ) : null}

            <div
                className={tcls(
                    'flex',
                    'flex-col',
                    'lg:flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <TableOfContents
                    space={space}
                    customization={customization}
                    content={content}
                    pages={pages}
                    activePage={page}
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
                    visibleOnDesktop={!!page.layout.tableOfContents}
                />
                <div className={tcls('flex-1', 'flex', 'flex-col')}>
                    {withFullPageCover && page.cover ? (
                        <PageCover
                            as="full"
                            page={page}
                            cover={page.cover}
                            context={contentRefContext}
                        />
                    ) : null}
                    <div className={tcls('flex', 'flex-row')}>
                        <PageBody
                            space={space}
                            customization={customization}
                            context={contentRefContext}
                            page={page}
                            document={document}
                            withDesktopTableOfContents={!!page.layout.tableOfContents}
                            withAside={!!page.layout.outline}
                        />
                        {page.layout.outline ? (
                            <PageAside
                                space={space}
                                customization={customization}
                                page={page}
                                document={document}
                                withHeaderOffset={withTopHeader}
                                withFullPageCover={withFullPageCover}
                            />
                        ) : null}
                    </div>
                </div>
            </div>

            {customization.themes.toggeable ||
            customization.footer.copyright ||
            customization.footer.logo ||
            customization.footer.groups?.length ? (
                <Footer
                    space={space}
                    context={contentRefContext}
                    customization={customization}
                    asFullWidth={asFullWidth}
                />
            ) : null}

            <React.Suspense fallback={null}>
                <SearchModal spaceId={space.id} withAsk={customization.aiSearch.enabled} />
            </React.Suspense>
        </div>
    );
}
