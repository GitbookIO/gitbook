import React from 'react';

import { Icon } from '@gitbook/icons';

import { Favicon } from '../utils';
import { HighlightQuery } from './HighlightQuery';
import type { ComputedRecordResult } from './search-types';
import { SearchResultItem } from './SearchResultItem';
import { tString, useLanguage } from '@/intl/client';

export const SearchRecordResultItem = React.forwardRef(function SearchRecordResultItem(
    props: {
        query: string;
        item: ComputedRecordResult;
        active: boolean;
        style?: React.CSSProperties;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { query, item, active, style, ...rest } = props;
    const language = useLanguage();

    const domain = getDomain(item.href);

    return (
        <SearchResultItem
            ref={ref}
            href={item.href}
            active={active}
            data-testid="search-record-result"
            action={tString(language, 'view')}
            leadingIcon={
                <Favicon
                    url={item.href}
                    className="size-4"
                    fallback={<Icon icon="memo" className="size-4" />}
                />
            }
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    recordId: item.id,
                },
            }}
            aria-label={tString(language, 'search_page_result_title', item.title)}
            style={{ ...style }}
            {...rest}
        >
            <p className="line-clamp-2 text-base font-semibold leading-snug text-tint-strong">
                <HighlightQuery query={query} text={item.title} />
            </p>
            {domain ? (
                <p className="text-sm text-tint/7 group-[.is-active]:text-tint contrast-more:text-tint">
                    {domain}
                </p>
            ) : null}
        </SearchResultItem>
    );
});

/**
 * Get the domain from a URL.
 */
function getDomain(input: string) {
    try {
        const url = new URL(input);
        return url.hostname;
    } catch {
        return null;
    }
}
