import * as React from 'react';

import { api } from '@/lib/api';
import { resolvePageId } from '@/lib/pages';
import { DocumentView } from '@/components/DocumentView';

import { SpaceParams } from '../../fetch';
import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';
import { notFound } from 'next/navigation';

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
export default async function PDFHTMLOutput(props: { params: SpaceParams; searchParams: PDFSearchParams }) {
    const { params, searchParams } = props;
    const { spaceId } = params;

    const [{ data: space }, { data: revision }] = await Promise.all([
        api().spaces.getSpaceById(spaceId),
        api().spaces.getCurrentRevision(spaceId),
    ]);

    const pages = selectPages(revision, searchParams).slice(0, 4); // TODO: remove slice

    return (
        <>
            {pages.map(({ page, depth }) => (
                page.type === 'group' ? <PDFPageGroup space={space} revision={revision} page={page} /> : <PDFPageDocument space={space} revision={revision} page={page} />
            ))}
        </>
    )
}

async function PDFPageGroup(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageGroup;
}) {
    const { page } = props;

    return (
        <div>
            <h1>{page.title}</h1>
        </div>
    )
}

async function PDFPageDocument(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
}) {
    const { space, revision, page } = props;

    const {
        data: { document },
    } = await api().spaces.getPageInRevisionById(space.id, revision.id, page.id);

    return (
        <div>
            <h1>{page.title}</h1>
            <DocumentView
                document={document}
                style={'mt-6'}
                context={{
                    space,
                    revision,
                    page,
                }}
            />
        </div>
    )
}

type FlatPageEntry = { page: RevisionPageDocument | RevisionPageGroup; depth: number };

/**
 * Compute the ordered flat set of pages to render.
 */
function selectPages(revision: Revision, params: PDFSearchParams): FlatPageEntry[] {
    const flattenPage = (page: RevisionPageDocument | RevisionPageGroup, depth: number): FlatPageEntry[] => {
        return [
            { page, depth },
            ...page.pages.flatMap((child) => child.type === 'link' ? [] : flattenPage(child, depth + 1)),
        ];
    }

    if (params.page) {
        const found = resolvePageId(revision, params.page);
        if (!found || found.page.type === 'link') {
            notFound();
        }

        if (!params.only) {
            return [{ page: found.page, depth: 0 }];
        }

        return flattenPage(found.page, 0);
    }

    return revision.pages.flatMap((page) => page.type === 'link' ? [] : flattenPage(page, 0));
}

