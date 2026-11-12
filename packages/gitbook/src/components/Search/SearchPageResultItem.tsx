import React from 'react';

import { Icon, type IconName } from '@gitbook/icons';

import { Tooltip } from '../primitives';
import { getPageResultPresentation } from './getPageResultHref';
import { HighlightQuery } from './HighlightQuery';
import type { ComputedPageResult } from './search-types';
import { SearchResultItem } from './SearchResultItem';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export const SearchPageResultItem = React.forwardRef(function SearchPageResultItem(
    props: {
        query: string;
        item: ComputedPageResult;
        active: boolean;
        style?: React.CSSProperties;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, style, ...rest } = props;
    const language = useLanguage();

    const { preview: bestSection, description, href } = getPageResultPresentation(item);
    const preview = bestSection
        ? [bestSection.title, bestSection.body].filter(Boolean).join(' · ')
        : undefined;

    return (
        <SearchResultItem
            ref={ref}
            href={href}
            active={active}
            data-testid="search-page-result"
            action={tString(language, 'view')}
            leadingIcon={<Icon icon="file-lines" className="size-4" />}
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            style={{
                ...style,
            }}
            {...rest}
        >
            <Breadcrumbs breadcrumbs={item.breadcrumbs} />
            <p className="line-clamp-1 font-heading text-base font-semibold leading-snug text-tint-strong">
                <HighlightQuery query={query} text={item.title} />
            </p>
            <div
                className={tcls(
                    'relative h-5 w-full transition-[height] duration-300',
                    !preview && !description ? 'h-0' : ''
                )}
                style={{ transitionDelay: style?.animationDelay }}
            >
                {preview ? (
                    <p
                        className="animate-blur-in absolute inset-0 line-clamp-1 origin-left text-sm"
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery query={query} text={preview} />
                    </p>
                ) : null}

                {description ? (
                    <p
                        className={tcls(
                            'absolute inset-0 line-clamp-1 origin-left text-sm',
                            preview ? 'hidden animate-blur-out' : ''
                        )}
                        style={{ animationDelay: style?.animationDelay }}
                    >
                        <HighlightQuery query={query} text={description} />
                    </p>
                ) : null}
            </div>
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
                      delay={0}
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
