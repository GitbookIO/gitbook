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
                'gap-4',
                'flex-row',
                'items-center',
                'p-4',
                'border-t',
                'border-dark/2',
                'dark:border-light/1',
                'first:border-none',
                'text-base',
                'font-medium',
                'hover:bg-dark/1',
                'dark:hover:bg-light/1',
                'group',
                active
                    ? [
                          'is-active',
                          'bg-primary-50',
                          'text-contrast-primary-50',
                          'dark:bg-primary-800',
                          'dark:text-contrast-primary-800',
                          'hover:bg-primary-100/8',
                          'dark:hover:bg-primary-700/7',
                      ]
                    : null,
            )}
        >
            <div className="size-4">
                <Icon
                    icon="file-lines"
                    className={tcls('size-4', active ? 'text-primary' : 'opacity-5')}
                />
            </div>
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
            <div
                className={tcls(
                    'p-2',
                    'rounded',
                    'straight-corners:rounded-none',
                    active ? ['bg-primary', 'text-contrast-primary'] : ['opacity-6'],
                )}
            >
                <Icon
                    icon={active ? 'arrow-turn-down-left' : 'chevron-right'}
                    className={tcls('size-4')}
                />
            </div>
        </Link>
    );
});
