import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { Button, Link } from '../primitives';
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
    const language = useLanguage();
    const { query, item, active } = props;

    const breadcrumbs =
        item.breadcrumbs?.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
                {crumb.icon ? <Icon className="size-3" icon={crumb.icon as IconName} /> : null}
                {crumb.label}
            </span>
        )) ?? [];

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
                'rounded-lg',
                'straight-corners:rounded-none',
                'text-base',
                'font-medium',
                'text-tint-strong',
                'hover:bg-tint-hover',
                'group',
                active && [
                    'is-active',
                    'bg-primary',
                    'text-primary-strong',
                    'hover:bg-primary-hover',
                ]
            )}
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
        >
            <div className="size-4">
                <Icon
                    icon="file"
                    className={tcls('size-4', active ? 'text-primary-subtle' : 'text-tint-subtle')}
                />
            </div>
            <div className={tcls('flex', 'flex-col', 'w-full')}>
                {breadcrumbs.length > 0 ? (
                    <div
                        className={tcls(
                            'text-xs',
                            active ? 'text-primary-subtle' : 'text-neutral-subtle',
                            // 'opacity-6',
                            'contrast-more:opacity-11',
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
                                        key={`${crumb.key}-icon`}
                                        icon="chevron-right"
                                        className="size-3"
                                    />
                                ) : null}
                                <span key={crumb.key} className="line-clamp-1">
                                    {crumb}
                                </span>
                            </>
                        ))}
                    </div>
                ) : null}
                <HighlightQuery query={query} text={item.title} />
            </div>
            {active ? (
                <Button
                    icon="arrow-turn-down-left"
                    size="small"
                    label={tString(language, 'view')}
                />
            ) : (
                <Icon icon="chevron-right" className="size-4 text-tint-subtle/6" />
            )}
        </Link>
    );
});
