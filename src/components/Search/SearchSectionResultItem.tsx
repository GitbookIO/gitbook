import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedSectionResult } from './server-actions';

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
                'pl-6',
                'hover:bg-dark/1',
                active ? ['bg-primary-50'] : null,
            )}
        >
            <div className={tcls('border-l', 'p-3', 'border-dark/2')}>
                {item.title ? (
                    <p className={tcls('text-base', 'text-dark/7', 'dark:text-dark/7')}>
                        <HighlightQuery query={query} text={item.title} />
                    </p>
                ) : null}
                {item.body ? (
                    <p
                        className={tcls(
                            'text-sm',
                            'text-dark',
                            'line-clamp-6',
                            'linear-mask-gradient',
                            'dark:text-dark',
                        )}
                    >
                        <HighlightQuery query={query} text={item.body} />
                    </p>
                ) : null}
            </div>
        </Link>
    );
});
