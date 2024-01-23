import Link from 'next/link';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { HighlightQuery } from './HighlightQuery';
import type { ComputedSectionResult } from './server-actions';

export const SearchSectionResultItem = React.forwardRef(function SearchSectionResultItem(
    props: { query: string; item: ComputedSectionResult; active: boolean; onClick: () => void },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { query, item, active, onClick } = props;

    return (
        <Link
            ref={ref}
            href={item.href}
            onClick={onClick}
            className={tcls(
                'search-section-result-item',
                'flex',
                'flex-col',
                'pl-6',
                'hover:bg-dark/1',
                'dark:hover:bg-light/1',
                active ? ['bg-dark/1', 'dark:bg-light/1'] : null,
            )}
        >
            <div className={tcls('border-l', 'p-3', 'border-dark/2', 'dark:border-light/2')}>
                {item.title ? (
                    <p className={tcls('text-base', 'text-dark/7', 'dark:text-light/8')}>
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
                            'z-[-1]', //to force stacking order
                            'relative',
                            'dark:text-light/8',
                        )}
                    >
                        <HighlightQuery query={query} text={item.body} />
                    </p>
                ) : null}
            </div>
        </Link>
    );
});
