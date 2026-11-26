'use client';

import { useSearchParams } from 'next/navigation';
import type React from 'react';

import { Icon } from '@gitbook/icons';

import { CONTENT_STYLE_REDUCED } from '../layout';
import { Button } from '../primitives';
import {
    HIDE_PENDING_UPDATES,
    markUpdatesPaginationScroll,
    usePaginatedUpdates,
} from './PaginatedUpdates';
import { tString } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations';
import { tcls } from '@/lib/tailwind';
import {
    UPDATES_FILTER_SEARCH_PARAM,
    UPDATES_MAX_PAGE,
    setUpdatesPageParam,
} from '@/lib/updates-url';

export function UpdatesPagination(props: { language: TranslationLanguage; baseHref: string }) {
    const { language, baseHref } = props;
    const updates = usePaginatedUpdates();
    const searchParams = useSearchParams();
    if (!updates?.view.pagination || updates.view.pagination.totalPages <= 1) {
        return null;
    }

    const { view, goToPage } = updates;
    const { page, totalPages, totalItems, start, end } = updates.view.pagination;
    const number = new Intl.NumberFormat(language.locale);
    const previousLabel = tString(language, 'previous_page');
    const nextLabel = tString(language, 'next_page');

    function buttonProps(targetPage: number, rel: 'prev' | 'next') {
        if (view.status !== 'unfiltered') {
            return { onClick: () => goToPage(targetPage) };
        }
        const params = new URLSearchParams(searchParams?.toString());
        params.delete(UPDATES_FILTER_SEARCH_PARAM);
        setUpdatesPageParam(params, targetPage);
        const query = params.toString();
        let href = baseHref;
        if (query) {
            href += `?${query}`;
        }
        return {
            href,
            rel,
            onClick: (event: React.MouseEvent) => {
                if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                ) {
                    return;
                }
                markUpdatesPaginationScroll(targetPage);
            },
        };
    }

    return (
        <div
            className={tcls(
                CONTENT_STYLE_REDUCED,
                'mt-8 flex items-center justify-between gap-2 border-t border-tint-subtle pt-4',
                view.status === 'unfiltered' && HIDE_PENDING_UPDATES
            )}
        >
            <div aria-live="polite" className="text-sm text-tint">
                {tString(
                    language,
                    'updates_pagination_range',
                    number.format(start),
                    number.format(end),
                    number.format(totalItems)
                )}
            </div>
            <nav
                aria-label={tString(language, 'updates_pagination_navigation')}
                className="flex justify-end gap-2"
            >
                {page > 1 && (
                    <Button
                        variant="blank"
                        size="small"
                        icon="chevron-left"
                        label={previousLabel}
                        {...buttonProps(page - 1, 'prev')}
                    />
                )}
                {page < totalPages && page < UPDATES_MAX_PAGE && (
                    <Button
                        variant="blank"
                        size="small"
                        trailing={<Icon icon="chevron-right" className="size-3" />}
                        label={nextLabel}
                        {...buttonProps(page + 1, 'next')}
                    />
                )}
            </nav>
        </div>
    );
}
