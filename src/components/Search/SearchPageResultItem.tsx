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
        onClick: (to: string) => void;
    },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { query, item, active, onClick } = props;

    return (
        <Link
            ref={ref}
            href={item.href}
            onClick={(event) => {
                event.preventDefault();
                onClick(item.href);
            }}
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
