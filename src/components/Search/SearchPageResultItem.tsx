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
                'flex-col',
                'rounded',
                'px-3',
                'py-3',
                'hover:bg-slate-50',
                'text-base',
                'text-slate-600',
                active ? ['bg-primary-50'] : null,
            )}
        >
            <HighlightQuery query={query} text={item.title} />
        </Link>
    );
});
