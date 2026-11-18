import React from 'react';

import { Icon } from '@gitbook/icons';

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

    const insights = {
        type: 'search_open_result' as const,
        query,
        result: {
            pageId: item.pageId,
            spaceId: item.spaceId,
        },
    };

    return (
        <SearchResultItem
            ref={ref}
            href={href}
            active={active}
            data-testid="search-page-result"
            action={tString(language, 'view')}
            insights={insights}
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

/**
 * One line of at most three crumbs: the first, a "⋯" for the steps between, and the last, which is
 * cut short when space runs out. The hidden steps show on a deliberate hover only, so moving the
 * mouse across results doesn't pop them up.
 */
const Breadcrumbs = (props: { breadcrumbs: ComputedPageResult['breadcrumbs'] }) => {
    const { breadcrumbs } = props;
    const first = breadcrumbs?.[0];
    if (!breadcrumbs || !first) return null;

    const last = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1] : undefined;
    const middle = breadcrumbs.slice(1, -1);
    const separator = <Icon icon="chevron-right" className="size-2 shrink-0" />;

    return (
        <div className="flex min-w-0 items-center gap-x-2 whitespace-nowrap text-xs font-normal text-tint/7 transition-colors group-[.is-active]:text-tint contrast-more:text-tint">
            <span className="shrink-0">{first.label}</span>
            {middle.length === 1 ? (
                <>
                    {separator}
                    <span className="min-w-[3ch] shrink truncate">{middle[0]?.label}</span>
                </>
            ) : middle.length > 1 ? (
                <>
                    {separator}
                    <Tooltip
                        delay={1000}
                        label={
                            <span className="flex flex-col py-0.5">
                                {middle.map((crumb, index) => (
                                    <span key={index}>{crumb.label}</span>
                                ))}
                            </span>
                        }
                    >
                        <span className="flex shrink-0 items-center">
                            <Icon icon="ellipsis" className="size-3" />
                            <span className="sr-only">
                                {middle.map((crumb) => crumb.label).join(' › ')}
                            </span>
                        </span>
                    </Tooltip>
                </>
            ) : null}
            {last ? (
                <>
                    {separator}
                    <span className="min-w-[3ch] shrink truncate">{last.label}</span>
                </>
            ) : null}
        </div>
    );
};
