import React from 'react';

import { tString, useLanguage } from '@/intl/client';
import { HighlightQuery } from './HighlightQuery';
import { SearchResultItem } from './SearchResultItem';
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
        <SearchResultItem
            ref={ref}
            href={item.href}
            size="small"
            active={active}
            action={tString(language, 'view')}
            data-testid="search-page-section-result"
            insights={{
                type: 'search_open_result',
                query,
                result: {
                    pageId: item.pageId,
                    spaceId: item.spaceId,
                },
            }}
        >
            <div className="grow border-tint-subtle border-l-2 pl-4">
                {item.title ? (
                    <p className="font-semibold">
                        <HighlightQuery query={query} text={item.title} />
                    </p>
                ) : null}
                {item.body ? highlightQueryInBody(item.body, query) : null}
            </div>
        </SearchResultItem>
    );
});

function highlightQueryInBody(body: string, query: string) {
    const idx = body.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());

    // Ensure the query to be highlighted is visible in the body.
    return (
        <p className="wrap-anywhere relative line-clamp-3 text-sm">
            <HighlightQuery query={query} text={idx < 20 ? body : `...${body.slice(idx - 10)}`} />
        </p>
    );
}
