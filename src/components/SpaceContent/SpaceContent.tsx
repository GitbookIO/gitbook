import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';

import { TableOfContents } from '@/components/TableOfContents';
import { tcls } from '@/lib/tailwind';
import { Header } from '@/components/Header';
import { PageBody } from '@/components/PageBody';
import React from 'react';
import { SearchModal } from '@/components/Search';
import { Footer } from '@/components/Footer';
import { hasFullWidthBlock } from '@/lib/document';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '@/components/layout';
import { PageAside } from '../PageAside';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceContent(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    document: any;
}) {
    const { space, revision, page, ancestors, document } = props;
    const asFullWidth = hasFullWidthBlock(document);

    return (
        <div>
            <Header space={space} asFullWidth={asFullWidth} />
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],
                )}
            >
                <TableOfContents revision={revision} activePage={page} ancestors={ancestors} />
                <PageBody space={space} revision={revision} page={page} document={document} />
                <PageAside page={page} document={document} />
            </div>
            <Footer space={space} />
            <React.Suspense fallback={null}>
                <SearchModal />
            </React.Suspense>
        </div>
    );
}
