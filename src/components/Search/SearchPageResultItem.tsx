import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './searchContent';

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
                'rounded',
                'px-6',
                'py-3',
                'hover:bg-dark/1',
                'text-base',
                'text-dark',
                'font-semibold',
                'mt-6',
                'first:mt-0',
                active ? ['bg-primary-50'] : null,
            )}
        >
            <HighlightQuery query={query} text={item.title} />
        </Link>
    );
});
