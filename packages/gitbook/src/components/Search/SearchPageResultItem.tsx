import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';
import { SkeletonParagraph, Tooltip } from '../primitives';
import { Emoji } from '../primitives/Emoji/Emoji';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
import type { MergedPageResult } from './reciprocalRankFusion';
import type { ComputedPageResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

type PageItem = ComputedPageResult | LocalPageResult | MergedPageResult;

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: PageItem;
        active: boolean;
        style?: React.CSSProperties;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, style, ...rest } = props;
    const language = useLanguage();

    const bestSection = item.type === 'page' ? item.bestSection : undefined;
    const href = (() => {
        if (item.type !== 'page' || !item.bestSection || item.bestSection.score <= item.score) {
            return 'href' in item ? item.href : item.pathname;
        }
        return item.bestSection.href;
    })();

    const emoji = 'emoji' in item ? item.emoji : undefined;
    const icon = 'icon' in item ? item.icon : undefined;

    const leadingIcon = emoji ? (
        <span className="flex size-4 shrink-0 items-center justify-center">
            <Emoji code={emoji} style="text-base leading-none" />
        </span>
    ) : icon ? (
        <Icon icon={icon as IconName} className="size-4" />
    ) : (
        <Icon icon="file-lines" className="size-4" />
    );

    const insights =
        item.type === 'page'
            ? {
                  type: 'search_open_result' as const,
                  query,
                  result: {
                      pageId: item.pageId,
                      spaceId: item.spaceId,
                  },
              }
            : undefined;

    return (
        <SearchResultItem
            ref={ref}
            href={href}
            active={active}
            key={item.type === 'page' ? item.pageId : item.id}
            data-testid="search-page-result"
            action={tString(language, 'view')}
            leadingIcon={leadingIcon}
            insights={insights}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            className="animate-blur-in-height"
            style={{
                ...style,
            }}
            {...rest}
        >
            <Breadcrumbs breadcrumbs={item.breadcrumbs} />
            <p className="line-clamp-1 font-semibold text-base text-tint-strong leading-snug">
                <HighlightQuery query={query} text={item.title} />
            </p>
            <div className="relative h-5 w-full">
                {bestSection?.body ? (
                    <p
                        className="absolute inset-0 line-clamp-1 origin-left animate-blur-in text-sm"
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery
                            query={query}
                            text={`${bestSection.title ? `${bestSection.title} · ` : ''}${bestSection.body}`}
                        />
                    </p>
                ) : null}

                {'description' in item && item.description ? (
                    <p
                        className={tcls(
                            'absolute inset-0 line-clamp-1 origin-left text-sm',
                            bestSection?.body ? 'animate-blur-out' : ''
                        )}
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery query={query} text={item.description} />
                    </p>
                ) : null}

                {item.type === 'local-page' ? (
                    <SkeletonParagraph
                        size="small"
                        lines={1}
                        className={tcls(
                            'absolute inset-0 origin-left',
                            bestSection?.body || item.description ? 'animate-blur-out' : ''
                        )}
                        style={{ animationDelay: style?.animationDelay }}
                    />
                ) : null}
            </div>
        </SearchResultItem>
    );
});

const Breadcrumbs = (props: {
    breadcrumbs: PageItem['breadcrumbs'];
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
        'text-tint/7 contrast-more:text-tint group-[.is-active]:text-tint text-xs'
    );
};
