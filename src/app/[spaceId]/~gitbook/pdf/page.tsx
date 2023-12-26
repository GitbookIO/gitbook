import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { DocumentView } from '@/components/DocumentView';
import { getDocument, getSpace, getRevisionPages, ContentPointer } from '@/lib/api';
import { pagePDFContainerId, PageHrefContext } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { OpenPrintDialog } from './OpenPrintDialog';
import { SpaceParams } from '../../fetch';
import './pdf.css';

export const runtime = 'edge';

interface PDFSearchParams {
    /** Page to export. If none is passed, all pages are exported. */
    page?: string;
    /** If true, only the `page` is exported, and not its descendant */
    only?: boolean;
    /** Limit the number of pages */
    limit?: number;
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

    const pages = selectPages(rootPages, searchParams).slice(0, searchParams.limit ?? 10);

    const linksContext: PageHrefContext = {
        pdf: pages.map(({ page }) => page.id),
    };

    return (
        <div
            className={tcls(
                'my-11',
                'print:my-0',
                'mx-auto',
                'max-w-4xl',
                'w-full',
                'p-12',
                'print:p-0',
                'shadow-xl',
                'print:shadow-none',
                'rounded-sm',
                'bg-white',
            )}
        >
            <SpaceIntro space={space} />
            {pages.map(({ page, depth }) =>
                page.type === 'group' ? (
                    <PDFPageGroup key={page.id} space={space} page={page} />
                ) : (
                    <React.Suspense key={page.id} fallback={null}>
                        <PDFPageDocument
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
                    </React.Suspense>
                ),
            )}

            <OpenPrintDialog />
        </div>
    );
}

async function SpaceIntro(props: { space: Space }) {
    const { space } = props;

    return (
        <div className={tcls('flex', 'items-center', 'justify-center', 'py-12')}>
            <h1 className={tcls('text-6xl', 'font-bold')}>{space.title}</h1>
        </div>
    );
}

async function PDFPageGroup(props: { space: Space; page: RevisionPageGroup }) {
    const { page } = props;

    return (
        <div
            className={tcls(
                'break-before-page',
                'mt-10',
                'print:mt-0',
                'flex',
                'items-center',
                'justify-center',
                'py-12',
            )}
        >
            <h1 className={tcls('text-5xl', 'font-bold')}>{page.title}</h1>
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
        <div
            id={pagePDFContainerId(page)}
            className={tcls('break-before-page', 'mt-10', 'print:mt-0')}
        >
            <h1 className={tcls('text-3xl', 'font-bold')}>{page.title}</h1>
            {document ? (
                <DocumentView
                    document={document}
                    style={'mt-6'}
                    blockStyle={['max-w-full']}
                    context={{
                        resolveContentRef: (ref) => resolveContentRef(ref, refContext),
                        getId: (id) => pagePDFContainerId(page, id),
                    }}
                />
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
