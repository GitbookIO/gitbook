import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedSectionResult } from './server-actions';
import { Link } from '../primitives';

export const SearchSectionResultItem = React.forwardRef(function SearchSectionResultItem(
    props: {
        query: string;
        item: ComputedSectionResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { query, item, active } = props;

    return (
        <Link
            ref={ref}
            href={item.href}
            className={tcls(
                'search-section-result-item',
                '[&:has(+:not(&))]:mb-6',
                'flex',
                'flex-col',
                'mb-2',
                'px-4',
                'sm:px-12',
                'hover:bg-dark-4/2',
                'dark:hover:bg-light-4/2',
                'text-dark/8',
                'dark:text-light/8',
                'font-normal',
                'transition-colors',
                active ? ['bg-dark/1', 'dark:bg-light/1'] : null,
            )}
        >
            <div
                className={tcls(
                    'border-l-2',
                    'px-4',
                    'py-2',
                    'border-dark/2',
                    'dark:border-light/2',
                )}
            >
                {item.title ? (
                    <p className={tcls('text-base', 'mb-2')}>
                        <HighlightQuery query={query} text={item.title} />
                    </p>
                ) : null}
                {item.body ? (
                    <p className={tcls('text-sm', 'line-clamp-3', 'relative')}>
                        <HighlightQuery query={query} text={item.body} />
                    </p>
                ) : null}
            </div>
        </Link>
    );
});
