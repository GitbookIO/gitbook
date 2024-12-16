import { Icon } from '@gitbook/icons';
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
    },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { query, item, active } = props;

    return (
        <Link
            ref={ref}
            href={item.href}
            className={tcls(
                '[&:has(+:not(&))]:mb-6',
                'flex',
                'items-center',
                'pl-6',
                'sm:pl-12',
                'pr-4',
                'text-dark/8',
                'dark:text-light/8',
                'hover:bg-dark/1',
                'dark:hover:bg-light/1',
                'font-normal',
                'py-2',
                'group',
                active && [
                    'is-active',
                    'bg-primary-50',
                    'text-contrast-primary-50',
                    'dark:bg-primary-800',
                    'dark:text-contrast-primary-800',
                    'hover:bg-primary-100/8',
                    'dark:hover:bg-primary-700/7',
                ],
            )}
        >
            <div
                className={tcls(
                    'border-l-2',
                    'px-4',
                    'py-1',
                    'flex',
                    'flex-1',
                    'overflow-hidden',
                    'flex-col',
                    'border-dark/2',
                    'dark:border-light/2',
                )}
            >
                {item.title ? (
                    <p className={tcls('text-base', 'mb-2')}>
                        <HighlightQuery query={query} text={item.title} />
                    </p>
                ) : null}
                {item.body ? (
                    <p className={tcls('text-sm', 'line-clamp-3', 'relative')}>
                        <HighlightQuery query={query} text={item.body} />
                    </p>
                ) : null}
            </div>
            <div
                className={tcls(
                    'p-2',
                    'rounded',
                    'straight-corners:rounded-none',
                    'bg-primary',
                    'text-contrast-primary',
                    'hidden',
                    'sm:block',
                    active ? ['opacity-11', 'block'] : ['opacity-0'],
                )}
            >
                <Icon icon="arrow-turn-down-left" className={tcls('size-4')} />
            </div>
        </Link>
    );
});
