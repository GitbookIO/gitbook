import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';

import { TableOfContents } from '@/components/TableOfContents';
import { tcls } from '@/lib/tailwind';
import { Header } from '@/components/Header';
import { PageBody } from '@/components/PageBody';
import React from 'react';
import { SearchModal } from '@/components/Search';
import { Footer } from '@/components/Footer';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceContent(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
}) {
    const { space, revision, page, ancestors } = props;

    return (
        <div>
            <Header space={space} />
            <div className={tcls('flex', 'flex-row', 'max-w-8xl mx-auto px-4 sm:px-6 md:px-8')}>
                <TableOfContents revision={revision} activePage={page} ancestors={ancestors} />
                <PageBody space={space} revision={revision} page={page} />
            </div>
            <Footer space={space} />
            <React.Suspense fallback={null}>
                <SearchModal />
            </React.Suspense>
        </div>
    );
}
