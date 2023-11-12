import {
    Collection,
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    Space,
} from '@gitbook/api';
import React from 'react';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';
import { PageBody } from '@/components/PageBody';
import { SearchModal } from '@/components/Search';
import { TableOfContents } from '@/components/TableOfContents';
import { hasFullWidthBlock } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { PageAside } from '../PageAside';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceContent(props: {
    space: Space;
    collection: Collection | null;
    collectionSpaces: Space[];
    customization: CustomizationSettings;
    revision: Revision;
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    document: any;
}) {
    const {
        space,
        collection,
        collectionSpaces,
        revision,
        customization,
        page,
        ancestors,
        document,
    } = props;
    const asFullWidth = hasFullWidthBlock(document);

    return (
        <div>
            <Header
                space={space}
                collection={collection}
                collectionSpaces={collectionSpaces}
                revision={revision}
                page={page}
                customization={customization}
                asFullWidth={asFullWidth}
            />
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <TableOfContents
                    space={space}
                    revision={revision}
                    activePage={page}
                    ancestors={ancestors}
                />
                <PageBody space={space} revision={revision} page={page} document={document} />
                <PageAside space={space} page={page} document={document} />
            </div>

            {customization.themes.toggeable ||
            customization.footer.copyright ||
            customization.footer.logo ||
            customization.footer.groups?.length ? (
                <Footer
                    space={space}
                    revision={revision}
                    page={page}
                    customization={customization}
                    asFullWidth={asFullWidth}
                />
            ) : null}

            <React.Suspense fallback={null}>
                <SearchModal />
            </React.Suspense>
        </div>
    );
}
