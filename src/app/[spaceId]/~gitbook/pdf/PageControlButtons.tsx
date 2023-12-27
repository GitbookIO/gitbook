'use client';

import { AlertTriangle } from '@geist-ui/icons';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { PDFSearchParams, getPDFParams } from './params';

/**
 * Dynamic controls to show active page and to let the user select between modes.
 */
export function PageControlButtons(props: {
    pdfParams: PDFSearchParams;
    pdfHref: string;
    /** Array of the [pageId, divId] */
    pageIds: Array<[string, string]>;
    /** Total number of pages targetted by the generation */
    total: number;
}) {
    const { pdfParams, pdfHref, pageIds, total } = props;

    const language = useLanguage();

    const divIds = React.useMemo(() => {
        return pageIds.map((entry) => entry[1]);
    }, [pageIds]);
    const activeDivId = useScrollActiveId(divIds, {
        threshold: 0,
    });
    const activeIndex = (activeDivId ? divIds.indexOf(activeDivId) : 0) + 1;
    const activePageId = pageIds[activeIndex - 1]?.[0];

    return (
        <>
            <div
                className={tcls(
                    'fixed',
                    'left-12',
                    'bottom-12',
                    'flex',
                    'flex-col',
                    'gap-2',
                    'print:hidden',
                    'z-50',
                )}
            >
                <Button
                    href={
                        pdfHref +
                        '?' +
                        getPDFParams({ ...pdfParams, page: activePageId, only: true })
                    }
                    variant="secondary"
                >
                    {t(language, 'pdf_mode_only_page')}
                </Button>
                <Button
                    href={
                        pdfHref + '?' + getPDFParams({ ...pdfParams, page: undefined, only: false })
                    }
                    variant="secondary"
                >
                    {t(language, 'pdf_mode_all')}
                </Button>
            </div>

            <div
                className={tcls(
                    'fixed',
                    'right-12',
                    'bottom-12',
                    'flex',
                    'flex-col',
                    'items-end',
                    'gap-2',
                    'print:hidden',
                    'z-50',
                )}
            >
                {total !== pageIds.length ? (
                    <div
                        role="banner"
                        className={tcls(
                            'flex',
                            'flex-row',
                            'items-start',
                            'mb-5',
                            'bg-yellow-100',
                            'border-yellow-400',
                            'text-yellow-800',
                            'shadow-sm',
                            'border',
                            'rounded-md',
                            'p-4',
                            'max-w-sm',
                        )}
                    >
                        <AlertTriangle className={tcls('size-6', 'mr-3', 'mt-1')} />{' '}
                        {t(language, 'pdf_limit_reached', total, pageIds.length)}
                    </div>
                ) : null}
                {/* <div className={tcls('flex', 'flex-row')}> */}
                <div
                    className={tcls(
                        'flex',
                        'flex-row',
                        'items-center',
                        'justify-center',
                        'text-lg',
                        'text-dark/6',
                        'px-6',
                        'py-2',
                        'bg-slate-100',
                        'rounded-full',
                        'shadow-sm',
                        'border-slate-300',
                        'border',
                    )}
                >
                    {t(language, 'pdf_page_of', activeIndex, pageIds.length)}
                </div>
                {/* </div> */}
            </div>
        </>
    );
}
