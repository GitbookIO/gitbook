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
                'search-section-result-item',
                '[&:has(+:not(&))]:mb-6',
                'flex',
                'flex-col',
                'pl-6',
                'hover:bg-dark-4/2',
                'dark:hover:bg-light-4/2',
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
