import { Icon } from '@gitbook/icons';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { tString, useLanguage } from '@/intl/client';
import { Button, Link } from '../primitives';
import { HighlightQuery } from './HighlightQuery';
import type { ComputedSectionResult } from './server-actions';

export const SearchSectionResultItem = React.forwardRef(function SearchSectionResultItem(
    props: {
        query: string;
        item: ComputedSectionResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active } = props;
    const language = useLanguage();

    return (
        <Link
            ref={ref}
            href={item.href}
            className={tcls(
                // '[&:has(+:not(&))]:mb-6',
                '-mt-2',
                'flex',
                'items-center',
                'pl-6',
                'sm:pl-12',
                'pr-4',
                'text-tint',
                'hover:bg-tint-hover',
                'font-normal',
                'py-2',
                'group',
                'rounded-lg',
                'straight-corners:rounded-none',
                active && [
                    'is-active',
                    'bg-primary',
                    'text-contrast-primary',
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
            <div
                className={tcls(
                    'border-l-2',
                    'px-4',
                    'py-1',
                    'flex',
                    'flex-1',
                    'overflow-hidden',
                    'flex-col',
                    'border-tint-subtle'
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
