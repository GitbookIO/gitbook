import { tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
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

    const domain = getDomain(item.href);
    const faviconURL = domain ? getFaviconURL(domain) : null;

    return (
        <SearchResultItem
            ref={ref}
            href={item.href}
            active={active}
            data-testid="search-record-result"
            action={tString(language, 'view')}
            leadingIcon={
                faviconURL ? (
                    <img src={faviconURL} alt="Favicon" className="size-4" />
                ) : (
                    <Icon icon="memo" className="size-4" />
                )
            }
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

/**
 * Use Google to get the favicon of a URL.
 */
function getFaviconURL(domain: string) {
    const result = new URL('https://www.google.com/s2/favicons');
    result.searchParams.set('domain', domain);
    result.searchParams.set('sz', '64');
    return result.toString();
}
