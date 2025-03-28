import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';

import { Link } from '../primitives';
import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './server-actions';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active } = props;

    const breadcrumbs: (string | React.ReactNode)[] = item.ancestors.map(
        (ancestor) => ancestor.title
    );
    if (item.spaceTitle) {
        breadcrumbs.unshift(item.spaceTitle);
    }
    if (item.section) {
        breadcrumbs.unshift(
            <span className="flex items-center gap-1">
                {item.section.icon ? (
                    <Icon className="size-3" icon={item.section.icon as IconName} />
                ) : null}
                {item.section.title}
            </span>
        );
    }

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
                'border-tint-subtle',
                'first:border-none',
                'text-base',
                'font-medium',
                'hover:bg-tint-hover',
                'group',
                active
                    ? ['is-active', 'bg-primary', 'text-contrast-primary', 'hover:bg-primary-hover']
                    : null
            )}
        >
            <div className="size-4">
                <Icon
                    icon="file-lines"
                    className={tcls('size-4', active ? 'text-primary' : 'text-tint-subtle')}
                />
            </div>
            <div className={tcls('flex', 'flex-col', 'w-full')}>
                {breadcrumbs.length > 0 ? (
                    <div
                        className={tcls(
                            'text-xs',
                            'opacity-6',
                            'font-normal',
                            'uppercase',
                            'tracking-wider',
                            'mb-1',
                            'flex',
                            'flex-wrap',
                            'gap-x-2',
                            'gap-y-1',
                            'items-center'
                        )}
                    >
                        {(breadcrumbs.length > 3
                            ? [
                                  ...breadcrumbs.slice(0, 2),
                                  <Icon key="ellipsis" icon="ellipsis-h" className="size-3" />,
                                  ...breadcrumbs.slice(-1),
                              ]
                            : breadcrumbs
                        ).map((crumb, index) => (
                            <>
                                {index !== 0 ? (
                                    <Icon
                                        key={`${index}-icon`}
                                        icon="chevron-right"
                                        className="size-3"
                                    />
                                ) : null}
                                <span key={index} className="line-clamp-1">
                                    {crumb}
                                </span>
                            </>
                        ))}
                    </div>
                ) : null}
                <HighlightQuery query={query} text={item.title} />
            </div>
            <div
                className={tcls(
                    'p-2',
                    'rounded',
                    'straight-corners:rounded-none',
                    active ? ['bg-primary-solid', 'text-contrast-primary-solid'] : ['opacity-6']
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
