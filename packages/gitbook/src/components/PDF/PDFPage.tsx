import type { GitBookSiteContext, GitBookSpaceContext } from '@/lib/context';
import type { GitBookLinker } from '@/lib/links';
import {
    type Revision,
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
    type SiteCustomizationSettings,
    SiteInsightsTrademarkPlacement,
    type Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { DocumentView } from '@/components/DocumentView';
import { TrademarkLink } from '@/components/TableOfContents/Trademark';
import type { PolymorphicComponentProp } from '@/components/utils/types';
import { getSpaceLanguage } from '@/intl/server';
import { tString } from '@/intl/translate';
import { resolvePageId } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { defaultCustomization } from '@/lib/utils';
import { type PDFSearchParams, getPDFSearchParams } from './urls';

import { PageControlButtons } from './PageControlButtons';
import { PrintButton } from './PrintButton';
import './pdf.css';
import { sanitizeGitBookAppURL } from '@/lib/app';
import { getPageDocument } from '@/lib/data';

const DEFAULT_LIMIT = 100;

/**
 * Generate the metadata for the PDF page.
 */
export async function generatePDFMetadata(
    context: GitBookSpaceContext | GitBookSiteContext
): Promise<Metadata> {
    return {
        title: 'site' in context ? context.site.title : context.space.title,
        robots: 'noindex, nofollow',
    };
}

/**
 * Render a space as a standalone HTML page that can be printed as a PDF.
 */
export async function PDFPage(props: {
    context: GitBookSpaceContext | GitBookSiteContext;
    searchParams: { [key: string]: string };
}) {
    const baseContext = props.context;
    const searchParams = new URLSearchParams(props.searchParams);
    const pdfParams = getPDFSearchParams(searchParams);

    const customization =
        'customization' in baseContext ? baseContext.customization : defaultCustomization();
    const language = getSpaceLanguage(baseContext);

    // Compute the pages to render
    const { pages, total } = selectPages(baseContext.revision.pages, pdfParams);
    const pageIds = pages.map(
        ({ page }) => [page.id, getPagePDFContainerId(page)] as [string, string]
    );

    // Build a linker that create anchor links for the pages rendered in the PDF page.
    const linker: GitBookLinker = {
        ...baseContext.linker,
        toPathForPage(input) {
            if (pages.some((p) => p.page.id === input.page.id)) {
                return `#${getPagePDFContainerId(input.page, input.anchor)}`;
            }
            if (input.page.type === RevisionPageType.Group) {
                return '#';
            }

            // Use an absolute URL to the page
            return input.page.urls.app;
        },
    };

    const context: GitBookSpaceContext = {
        ...baseContext,
        linker,
    };

    return (
        <div className="print-mode">
            {pdfParams.back !== 'false' ? (
                <div className={tcls('fixed', 'left-12', 'top-12', 'print:hidden', 'z-50')}>
                    <a
                        title={tString(language, 'pdf_goback')}
                        href={
                            (pdfParams.back ? sanitizeGitBookAppURL(pdfParams.back) : null) ??
                            linker.toAbsoluteURL(linker.toPathInSpace(''))
                        }
                        className={tcls(
                            'flex',
                            'flex-row',
                            'items-center',
                            'justify-center',
                            'text-sm',
                            'text-tint',
                            'hover:text-primary',
                            'p-4',
                            'rounded-full',
                            'bg-white',
                            'shadow-xs',
                            'hover:shadow-md',
                            'border-slate-300',
                            'border'
                        )}
                    >
                        <Icon icon="arrow-left" className={tcls('size-6')} />
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
                        'text-tint',
                        'hover:text-primary',
                        'p-4',
                        'rounded-full',
                        'bg-white',
                        'shadow-xs',
                        'hover:shadow-md',
                        'border-slate-300',
                        'border'
                    )}
                >
                    <Icon icon="print" className={tcls('size-6')} />
                </PrintButton>
            </div>

            <PageControlButtons
                params={pdfParams}
                pageIds={pageIds}
                total={total}
                trademark={
                    customization.trademark.enabled ? (
                        <TrademarkLink
                            context={context}
                            placement={SiteInsightsTrademarkPlacement.Pdf}
                        />
                    ) : null
                }
            />

            {pdfParams.only ? null : (
                <PDFSpaceIntro space={context.space} customization={customization} />
            )}
            {pages.map(({ page }) =>
                page.type === 'group' ? (
                    <PDFPageGroup key={page.id} space={context.space} page={page} />
                ) : (
                    <React.Suspense
                        key={page.id}
                        fallback={
                            <PrintPage id={getPagePDFContainerId(page)}>
                                <p>Loading...</p>
                            </PrintPage>
                        }
                    >
                        <PDFPageDocument page={page} context={context} />
                    </React.Suspense>
                )
            )}
        </div>
    );
}

async function PDFSpaceIntro(props: {
    space: Space;
    customization: SiteCustomizationSettings;
}) {
    const { space, customization } = props;

    return (
        <PrintPage isFirst>
            <div className={tcls('flex', 'items-center', 'justify-center', 'py-12')}>
                <h1 className={tcls('text-6xl', 'font-bold')}>
                    {customization.title ?? space.title}
                </h1>
            </div>
        </PrintPage>
    );
}

async function PDFPageGroup(props: { space: Space; page: RevisionPageGroup }) {
    const { page } = props;

    return (
        <PrintPage id={getPagePDFContainerId(page)}>
            <div
                className={tcls(
                    'break-before-page',
                    'mt-10',
                    'print:mt-0',
                    'flex',
                    'items-center',
                    'justify-center',
                    'py-12'
                )}
            >
                <h1 className={tcls('text-5xl', 'font-bold')}>{page.title}</h1>
            </div>
        </PrintPage>
    );
}

async function PDFPageDocument(props: {
    page: RevisionPageDocument;
    context: GitBookSpaceContext;
}) {
    const { page, context } = props;
    const document = await getPageDocument(context, page);

    return (
        <PrintPage id={getPagePDFContainerId(page)}>
            <h1 className={tcls('text-4xl', 'font-bold')}>{page.title}</h1>
            {page.description ? (
                <p className={tcls('decoration-primary/6', 'mt-2', 'mb-3')}>{page.description}</p>
            ) : null}

            {document ? (
                <DocumentView
                    document={document}
                    style="mt-6 space-y-6"
                    blockStyle="max-w-full"
                    context={{
                        mode: 'print',
                        contentContext: {
                            ...context,
                            page,
                        },
                        getId: (id) => getPagePDFContainerId(page, id),
                        withLinkPreviews: false, // We don't want to render link previews in the PDF.
                    }}
                    // We consider all pages as offscreen in PDF mode
                    // to ensure we can efficiently render as many pages as possible
                    isOffscreen={true}
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
    >
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
                'rounded-xs',
                'bg-white',
                'min-h-[29.7cm]',
                'print:min-h-0',
                isFirst ? null : 'break-before-page',
                'break-anywhere'
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
    params: PDFSearchParams
): { pages: FlatPageEntry[]; total: number } {
    const flattenPage = (
        page: RevisionPageDocument | RevisionPageGroup,
        depth: number
    ): FlatPageEntry[] => {
        return [
            { page, depth },
            ...page.pages.flatMap((child) => {
                if (child.type !== 'document') {
                    return [];
                }

                if (child.hidden) {
                    return [];
                }

                return flattenPage(child, depth + 1);
            }),
        ];
    };

    const limitTo = (entries: FlatPageEntry[]) => {
        return {
            // Apply a soft-limit, the limit can be controlled by the URL to allow testing
            pages: entries.slice(0, params.limit ?? DEFAULT_LIMIT),
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

    const allPages = rootPages.flatMap((page) => {
        if (page.type !== 'document' && page.type !== 'group') {
            return [];
        }

        if (page.hidden) {
            return [];
        }

        return flattenPage(page, 0);
    });
    return limitTo(allPages);
}

/**
 * Create the HTML ID for the container of a page or a given anchor in it.
 */
function getPagePDFContainerId(
    page: RevisionPageDocument | RevisionPageGroup,
    anchor?: string
): string {
    return `pdf-page-${page.id}${anchor ? `-${anchor}` : ''}`;
}
