import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';
import { Tooltip } from '../primitives';
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
            <Breadcrumbs breadcrumbs={item.breadcrumbs} />
            <p className="line-clamp-2 font-semibold text-base text-tint-strong leading-snug">
                <HighlightQuery query={query} text={item.title} />
            </p>
        </SearchResultItem>
    );
});

const Breadcrumbs = (props: {
    breadcrumbs: ComputedPageResult['breadcrumbs'];
    withOverflow?: boolean;
}) => {
    const { breadcrumbs, withOverflow = (breadcrumbs?.length ?? 0) > 4 } = props;

    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    const crumbs =
        breadcrumbs?.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
                {crumb.icon ? <Icon className="size-3" icon={crumb.icon as IconName} /> : null}
                {crumb.label}
            </span>
        )) ?? [];

    // Format breadcrumbs for display. Helper function to avoid code duplication across normal and in-tooltip display.
    function formatCrumbs(crumbs: React.ReactElement[], className?: string) {
        return (
            <div
                className={tcls(
                    'transition-colors',
                    'font-normal',
                    'flex',
                    'flex-wrap',
                    'gap-x-2',
                    'gap-y-0',
                    'items-center',
                    className
                )}
            >
                {crumbs.map((crumb, index) => (
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
        );
    }

    return formatCrumbs(
        withOverflow
            ? [
                  ...crumbs.slice(0, 3),
                  <Tooltip
                      key="breadcrumbs-overflow"
                      label={formatCrumbs(crumbs.slice(3, -1))}
                      rootProps={{ delayDuration: 0 }}
                      arrow
                  >
                      <span>
                          <Icon key="ellipsis" icon="ellipsis-h" className="size-3" />
                      </span>
                  </Tooltip>,
                  ...crumbs.slice(-1),
              ]
            : crumbs,
        'text-tint/7 contrast-more:text-tint group-[.is-active]:text-tint mb-1 text-xs uppercase leading-snug'
    );
};
