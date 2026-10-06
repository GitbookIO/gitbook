'use client';

import React from 'react';

import { Icon } from '@gitbook/icons';

import { type PDFSearchParams, getPDFURLSearchParams } from './urls';
import { useScrollActiveId } from '@/components/hooks';
import { Button } from '@/components/primitives';
import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

/**
 * Dynamic controls to show active page and to let the user select between modes.
 */
export function PageControlButtons(props: {
    params: PDFSearchParams;
    /** Array of the [pageId, divId] */
    pageIds: [string, string][];
    /** Total number of pages targetted by the generation, across all batches */
    total: number;
    /** Trademark to display */
    trademark?: React.ReactNode;
}) {
    const { params, pageIds, total, trademark } = props;

    const language = useLanguage();

    const divIds = React.useMemo(() => {
        return pageIds.map((entry) => entry[1]);
    }, [pageIds]);
    const activeDivId = useScrollActiveId(divIds, {
        threshold: 0,
        enabled: true,
    });
    const activeIndex = (activeDivId ? divIds.indexOf(activeDivId) : 0) + 1;
    const activePageId = pageIds[activeIndex - 1]?.[0];

    const batchEnd = params.offset + pageIds.length;
    const previousCount = Math.min(params.limit, params.offset);
    const nextCount = Math.min(params.limit, total - batchEnd);

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
                    'z-50'
                )}
            >
                {params.only ? null : (
                    <Button
                        href={`?${getPDFURLSearchParams({
                            ...params,
                            page: activePageId,
                            only: true,
                            limit: undefined,
                            offset: undefined,
                        }).toString()}`}
                        variant="secondary"
                        label={tString(language, 'pdf_mode_only_page')}
                    />
                )}
                <Button
                    href={`?${getPDFURLSearchParams({
                        ...params,
                        page: undefined,
                        only: false,
                        limit: undefined,
                        offset: undefined,
                    }).toString()}`}
                    variant="secondary"
                    label={tString(language, 'pdf_mode_all')}
                />

                {trademark ? <div className={tcls('mt-5')}>{trademark}</div> : null}
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
                    'z-50'
                )}
            >
                {previousCount > 0 || nextCount > 0 ? (
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
                            'shadow-xs',
                            'border',
                            'rounded-md',
                            'p-4',
                            'max-w-sm'
                        )}
                    >
                        <Icon
                            icon="triangle-exclamation"
                            className={tcls('size-6', 'mr-3', 'mt-1')}
                        />{' '}
                        <div>
                            <div>
                                {t(language, 'pdf_batch_range', params.offset + 1, batchEnd, total)}
                            </div>
                            <div className={tcls('flex', 'flex-row', 'flex-wrap', 'gap-x-3')}>
                                {previousCount > 0 ? (
                                    <a
                                        href={`?${getPDFURLSearchParams({
                                            ...params,
                                            offset: params.offset - previousCount,
                                        }).toString()}`}
                                        className={tcls('underline')}
                                    >
                                        {t(language, 'pdf_batch_previous', previousCount)}
                                    </a>
                                ) : null}
                                {nextCount > 0 ? (
                                    <a
                                        href={`?${getPDFURLSearchParams({
                                            ...params,
                                            offset: batchEnd,
                                        }).toString()}`}
                                        className={tcls('underline')}
                                    >
                                        {t(language, 'pdf_batch_next', nextCount)}
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}
                <div
                    className={tcls(
                        'flex',
                        'flex-row',
                        'items-center',
                        'justify-center',
                        'text-lg',
                        'text-tint',
                        'px-6',
                        'py-2',
                        'bg-slate-100',
                        'rounded-full',
                        'shadow-xs',
                        'border-slate-300',
                        'border'
                    )}
                >
                    {t(language, 'pdf_page_of', params.offset + activeIndex, total)}
                </div>
            </div>
        </>
    );
}
