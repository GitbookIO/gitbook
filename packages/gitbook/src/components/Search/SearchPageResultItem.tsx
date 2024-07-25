import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './server-actions';
import { Link } from '../primitives';

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
                'hover:bg-dark-4/2',
                'text-base',
                'text-dark',
                'font-semibold',
                'first:mt-0',
                '[&:has(+.search-section-result-item):not(:first-child)]:mt-6',
                'dark:text-light',
                'dark:hover:bg-light-4/2',
                active ? ['bg-dark/1', 'dark:bg-light/1'] : null,
            )}
        >
            {item.spaceTitle ? (
                <span className={tcls('opacity-6', 'font-normal', 'mr-2')}>
                    {item.spaceTitle + ' ›'}
                </span>
            ) : null}
            <HighlightQuery query={query} text={item.title} />
        </Link>
    );
});
