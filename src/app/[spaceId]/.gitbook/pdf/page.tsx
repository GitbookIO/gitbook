import * as React from 'react';

import { getDocument, getSpace, getRevisionPages, ContentPointer } from '@/lib/api';
import { resolvePageId } from '@/lib/pages';
import { pagePDFContainerId, PageHrefContext } from '@/lib/links';
import { DocumentView } from '@/components/DocumentView';

import { SpaceParams } from '../../fetch';
import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';
import { notFound } from 'next/navigation';
import { ContentRefContext } from '@/lib/references';

export const runtime = 'edge';

interface PDFSearchParams {
    /** Page to export. If none is passed, all pages are exported. */
    page?: string;
    /** If true, only the `page` is exported, and not its descendant */
    only?: boolean;
}

/**
 * Render a space as a standalone HTML page without interactive elements.
 * The HTML can be converted to PDF.
 */
export default async function PDFHTMLOutput(props: {
    params: SpaceParams;
    searchParams: PDFSearchParams;
}) {
    const { params, searchParams } = props;
    const { spaceId } = params;

    const contentPointer: ContentPointer = {
        spaceId,
    };

    const [space, rootPages] = await Promise.all([
        getSpace(spaceId),
        getRevisionPages(contentPointer),
    ]);

    const pages = selectPages(rootPages, searchParams).slice(0, 4); // TODO: remove slice

    const linksContext: PageHrefContext = {
        pdf: pages.map(({ page }) => page.id),
    };

    return (
        <>
            {pages.map(({ page, depth }) =>
                page.type === 'group' ? (
                    <PDFPageGroup key={page.id} space={space} page={page} />
                ) : (
                    <PDFPageDocument
                        key={page.id}
                        space={space}
                        page={page}
                        refContext={{
                            content: contentPointer,
                            space,
                            pages: rootPages,
                            page,
                            ...linksContext,
                        }}
                    />
                ),
            )}
        </>
    );
}

async function PDFPageGroup(props: { space: Space; page: RevisionPageGroup }) {
    const { page } = props;

    return (
        <div>
            <h1>{page.title}</h1>
        </div>
    );
}

async function PDFPageDocument(props: {
    space: Space;
    page: RevisionPageDocument;
    refContext: ContentRefContext;
}) {
    const { space, page, refContext } = props;

    const document = page.documentId ? await getDocument(space.id, page.documentId) : null;

    return (
        <div id={pagePDFContainerId(page)}>
            <h1>{page.title}</h1>
            {document ? (
                <DocumentView document={document} style={'mt-6'} context={refContext} />
            ) : null}
        </div>
    );
}

type FlatPageEntry = { page: RevisionPageDocument | RevisionPageGroup; depth: number };

/**
 * Compute the ordered flat set of pages to render.
 */
function selectPages(rootPages: Revision['pages'], params: PDFSearchParams): FlatPageEntry[] {
    const flattenPage = (
        page: RevisionPageDocument | RevisionPageGroup,
        depth: number,
    ): FlatPageEntry[] => {
        return [
            { page, depth },
            ...page.pages.flatMap((child) =>
                child.type === 'link' ? [] : flattenPage(child, depth + 1),
            ),
        ];
    };

    if (params.page) {
        const found = resolvePageId(rootPages, params.page);
        if (!found) {
            notFound();
        }

        if (!params.only) {
            return [{ page: found.page, depth: 0 }];
        }

        return flattenPage(found.page, 0);
    }

    return rootPages.flatMap((page) => (page.type === 'link' ? [] : flattenPage(page, 0)));
}
