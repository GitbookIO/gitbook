import { Icon } from '@gitbook/icons';
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
                'items-center',
                'px-4',
                'sm:px-12',
                'py-4',
                'sm:py-6',
                'border-t',
                'first:border-t-0',
                'border-dark/2',
                'dark:border-light/2',
                'hover:bg-dark-4/2',
                'text-base',
                'text-dark',
                'font-medium',
                'first:mt-0',
                'dark:text-light',
                'dark:hover:bg-light-4/2',
                active ? ['bg-dark/1', 'dark:bg-light/1'] : null,
            )}
        >
            <div className={tcls('flex', 'flex-col', 'w-full')}>
                {item.spaceTitle ? (
                    <div
                        className={tcls(
                            'text-xs',
                            'opacity-6',
                            'font-normal',
                            'uppercase',
                            'tracking-wider',
                            'mb-1',
                        )}
                    >
                        {item.spaceTitle}
                    </div>
                ) : null}
                <HighlightQuery query={query} text={item.title} />
            </div>
            <Icon
                icon="chevron-right"
                className={tcls('size-4', 'text-dark', 'dark:text-light', 'opacity-6')}
            />
        </Link>
    );
});
