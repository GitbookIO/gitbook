import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
import type { ComputedPageResult } from './server-actions';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, ...rest } = props;
    const language = useLanguage();

    const breadcrumbs =
        item.breadcrumbs?.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
                {crumb.icon ? <Icon className="size-3" icon={crumb.icon as IconName} /> : null}
                {crumb.label}
            </span>
        )) ?? [];

    return (
        <SearchResultItem
            ref={ref}
            href={item.href}
            active={active}
            data-testid="search-page-result"
            action={tString(language, 'view')}
            leadingIcon={<Icon icon="memo" className="size-4" />}
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            {...rest}
        >
            {breadcrumbs.length > 0 ? (
                <div
                    className={tcls(
                        'text-xs',
                        'text-tint/7',
                        'contrast-more:text-tint',
                        'group-[.is-active]:text-tint',
                        'transition-colors',
                        'font-normal',
                        'uppercase',
                        'leading-none',
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
                        <React.Fragment key={index}>
                            {index !== 0 ? (
                                <Icon
                                    key={`${crumb.key}-icon`}
                                    icon="chevron-right"
                                    className="size-2"
                                />
                            ) : null}
                            <span className="line-clamp-1">{crumb}</span>
                        </React.Fragment>
                    ))}
                </div>
            ) : null}
            <p className="line-clamp-2 font-semibold text-base text-tint-strong leading-snug">
                <HighlightQuery query={query} text={item.title} />
            </p>
        </SearchResultItem>
    );
});
