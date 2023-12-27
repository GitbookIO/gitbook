import { ArrowLeft, Printer } from '@geist-ui/icons';
import { Revision, RevisionPageDocument, RevisionPageGroup, Space } from '@gitbook/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { DocumentView } from '@/components/DocumentView';
import { PolymorphicComponentProp } from '@/components/utils/types';
import { getSpaceLanguage } from '@/intl/server';
import { tString } from '@/intl/translate';
import {
    getDocument,
    getSpace,
    getRevisionPages,
    ContentPointer,
    getSpaceCustomization,
} from '@/lib/api';
import { pagePDFContainerId, PageHrefContext, absoluteHref } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import './pdf.css';
import { PageControlButtons } from './PageControlButtons';
import { PDFSearchParams } from './params';
import { PrintButton } from './PrintButton';
import { SpaceParams } from '../../fetch';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: SpaceParams }): Promise<Metadata> {
    return {
        title: 'Print',
    };
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

    const [space, customization, rootPages] = await Promise.all([
        getSpace(spaceId),
        getSpaceCustomization(spaceId),
        getRevisionPages(contentPointer),
    ]);

    const language = getSpaceLanguage(customization);
    const { pages, total } = selectPages(rootPages, searchParams);

    const linksContext: PageHrefContext = {
        pdf: pages.map(({ page }) => page.id),
    };

    const pageIds = pages.map(
        ({ page }) => [page.id, pagePDFContainerId(page)] as [string, string],
    );

    return (
        <>
            {searchParams.back !== 'false' ? (
                <div className={tcls('fixed', 'left-12', 'top-12', 'print:hidden', 'z-50')}>
                    <a
                        title={tString(language, 'pdf_goback')}
                        href={searchParams.back ?? absoluteHref('')}
                        className={tcls(
                            'flex',
                            'flex-row',
                            'items-center',
                            'justify-center',
                            'text-sm',
                            'text-dark/6',
                            'hover:text-primary',
                            'p-4',
                            'dark:text-light/5',
                            'rounded-full',
                            'bg-white',
                            'shadow-sm',
                            'hover:shadow-md',
                            'border-slate-300',
                            'border',
                        )}
                    >
                        <ArrowLeft className={tcls('size-6')} />
                    </a>
                </div>
            ) : null}

            <div className={tcls('fixed', 'right-12', 'top-12', 'print:hidden', 'z-50')}>
                <PrintButton
                    title={tString(language, 'pdf_print')}
                    className={tcls(
                        'flex',
                        'flex-row',
                        'items-center',
                        'justify-center',
                        'text-sm',
                        'text-dark/6',
                        'hover:text-primary',
                        'p-4',
                        'dark:text-light/5',
                        'rounded-full',
                        'bg-white',
                        'shadow-sm',
                        'hover:shadow-md',
                        'border-slate-300',
                        'border',
                    )}
                >
                    <Printer className={tcls('size-6')} />
                </PrintButton>
            </div>

            <PageControlButtons
                pageIds={pageIds}
                pdfParams={searchParams}
                pdfHref={absoluteHref('~gitbook/pdf')}
                total={total}
            />

            {searchParams.only ? null : <SpaceIntro space={space} />}
            {pages.map(({ page, depth }) =>
                page.type === 'group' ? (
                    <PDFPageGroup key={page.id} space={space} page={page} />
                ) : (
                    <React.Suspense
                        key={page.id}
                        fallback={
                            <PrintPage id={pagePDFContainerId(page)}>
                                <p>Loading...</p>
                            </PrintPage>
                        }
                    >
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
        </>
    );
}

async function SpaceIntro(props: { space: Space }) {
    const { space } = props;

    return (
        <PrintPage isFirst>
            <div className={tcls('flex', 'items-center', 'justify-center', 'py-12')}>
                <h1 className={tcls('text-6xl', 'font-bold')}>{space.title}</h1>
            </div>
        </PrintPage>
    );
}

async function PDFPageGroup(props: { space: Space; page: RevisionPageGroup }) {
    const { page } = props;

    return (
        <PrintPage id={pagePDFContainerId(page)}>
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
        </PrintPage>
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
        <PrintPage id={pagePDFContainerId(page)}>
            <h1 className={tcls('text-4xl', 'font-bold')}>{page.title}</h1>
            {page.description ? (
                <p className={tcls('decoration-primary/6', 'mt-2', 'mb-3')}>{page.description}</p>
            ) : null}

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
        </PrintPage>
    );
}

function PrintPage(
    props: PolymorphicComponentProp<
        'div',
        {
            isFirst?: boolean;
        }
    >,
) {
    const { children, isFirst, className, ...rest } = props;

    return (
        <div
            {...rest}
            className={tcls(
                className,
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
                'min-h-[29.7cm]',
                'print:min-h-0',
                isFirst ? null : 'break-before-page',
            )}
        >
            {children}
        </div>
    );
}

type FlatPageEntry = { page: RevisionPageDocument | RevisionPageGroup; depth: number };

/**
 * Compute the ordered flat set of pages to render.
 */
function selectPages(
    rootPages: Revision['pages'],
    params: PDFSearchParams,
): { pages: FlatPageEntry[]; total: number } {
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

    const limitTo = (entries: FlatPageEntry[]) => {
        return {
            // Apply a soft-limit, the limit can be controlled by the URL to allow testing
            pages: entries.slice(0, params.limit ?? 100),
            total: entries.length,
        };
    };

    if (params.page) {
        const found = resolvePageId(rootPages, params.page);
        if (!found) {
            notFound();
        }

        if (!params.only) {
            return limitTo([{ page: found.page, depth: 0 }]);
        }

        return limitTo(flattenPage(found.page, 0));
    }

    const allPages = rootPages.flatMap((page) =>
        page.type === 'link' ? [] : flattenPage(page, 0),
    );
    return limitTo(allPages);
}
