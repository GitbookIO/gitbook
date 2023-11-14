import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedSectionResult } from './searchContent';

export const SearchSectionResultItem = React.forwardRef(function SearchSectionResultItem(
    props: { query: string; item: ComputedSectionResult; active: boolean },
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
                'pl-6',
                'hover:bg-slate-50',
                active ? ['bg-primary-50'] : null,
            )}
        >
            {item.title ? (
                <p className={tcls('text-base', 'text-slate-600')}>
                    <HighlightQuery query={query} text={item.title} />
                </p>
            ) : null}
            {item.body ? (
                <p className={tcls('text-sm', 'text-slate-400')}>
                    <HighlightQuery query={query} text={item.body} />
                </p>
            ) : null}
        </Link>
    );
});
