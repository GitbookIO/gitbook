import { tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
import { highlightQueryInBody } from './SearchSectionResultItem';
import type { ComputedRecordResult } from './server-actions';

export const SearchRecordResultItem = React.forwardRef(function SearchRecordResultItem(
    props: {
        query: string;
        item: ComputedRecordResult;
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
            data-testid="search-record-result"
            action={tString(language, 'view')}
            leadingIcon={<Icon icon="memo" className="size-4" />}
            // insights={{
            //     type: 'search_open_result',
            //     query,
            //     result: {
            //         pageId: item.pageId,
            //         spaceId: item.spaceId,
            //     },
            // }}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            {...rest}
        >
            <p className="line-clamp-2 font-semibold text-base text-tint-strong leading-snug">
                <HighlightQuery query={query} text={item.title} />
            </p>
            {item.description ? (
                <div className="grow border-tint-subtle border-l-2 pl-4">
                    {highlightQueryInBody(item.description, query)}
                </div>
            ) : null}
        </SearchResultItem>
    );
});
