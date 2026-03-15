import { tString, useLanguage } from '@/intl/client';
import { Icon, type IconName } from '@gitbook/icons';
import React from 'react';
import { Emoji } from '../primitives/Emoji/Emoji';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
import type { LocalPageResult } from './useLocalSearchResults';

/**
 * Result item for a locally-indexed page result inside the unified search list.
 * Mirrors the structure of SearchPageResultItem but works with LocalPageResult,
 * which only carries pathname/title/icon/emoji/description (no spaceId/breadcrumbs).
 */
export const SearchLocalPageResultItem = React.forwardRef(function SearchLocalPageResultItem(
    props: {
        query: string;
        item: LocalPageResult;
        active: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, ...rest } = props;
    const language = useLanguage();

    const leadingIcon = item.emoji ? (
        <span className="flex size-4 shrink-0 items-center justify-center">
            <Emoji code={item.emoji} style="text-base leading-none" />
        </span>
    ) : item.icon ? (
        <Icon icon={item.icon as IconName} className="size-4" />
    ) : (
        <Icon icon="memo" className="size-4" />
    );

    return (
        <SearchResultItem
            ref={ref}
            href={item.pathname}
            active={active}
            data-testid="search-local-page-result"
            action={tString(language, 'view')}
            leadingIcon={leadingIcon}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            {...rest}
        >
            <p className="line-clamp-2 font-semibold text-base text-tint-strong leading-snug">
                <HighlightQuery query={query} text={item.title} />
            </p>
            {item.description ? (
                <p className="line-clamp-1 text-sm leading-snug">
                    <HighlightQuery query={query} text={item.description} />
                </p>
            ) : null}
        </SearchResultItem>
    );
});
