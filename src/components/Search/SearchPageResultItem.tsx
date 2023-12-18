import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './server-actions';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
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
                'flex',
                'flex-row',
                'px-6',
                'py-3',
                'hover:bg-dark/1',
                'text-base',
                'text-dark',
                'font-semibold',
                'first:mt-0',
                '[&:has(+.search-section-result-item):not(:first-child)]:mt-6',
                'dark:text-light',
                'dark:hover:bg-light/1',
                active ? ['bg-primary-50'] : null,
            )}
        >
            <HighlightQuery query={query} text={item.title} />
        </Link>
    );
});
