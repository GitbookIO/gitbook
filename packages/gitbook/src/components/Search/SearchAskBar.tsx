'use client';

import { addRecentSearchQuery } from './recent-queries';
import { SearchResultItem } from './SearchResultItem';
import { useSearchLink } from './useSearch';
import type { Assistant } from '@/components/AI';
import { useCurrentContent } from '@/components/hooks';
import { t, tString, useLanguage } from '@/intl/client';

/**
 * Sticky single-line bar at the bottom of the search frame.
 * Clicking opens the AI assistant with the current query.
 */
export function SearchAskBar(props: {
    query: string;
    assistant: Assistant;
    active?: boolean;
    onHover?: () => void;
    onSelect?: () => void;
}) {
    const { query, assistant, active = false, onHover, onSelect } = props;
    const language = useLanguage();
    const { siteSpaceId } = useCurrentContent();
    const getSearchLinkProps = useSearchLink();

    const linkProps = getSearchLinkProps(
        {
            ask: query,
            query: null,
            open: assistant.mode === 'search',
        },
        () => {
            if (assistant.mode === 'search' && siteSpaceId) {
                addRecentSearchQuery(siteSpaceId, query, 'ask');
            }
            onSelect?.();
            assistant.open(query);
        }
    );

    return (
        <SearchResultItem
            {...linkProps}
            active={active}
            onHover={onHover}
            action={tString(language, 'ask')}
            leadingIcon={assistant.icon}
            data-testid="search-ask-question"
            className="gutter-stable rounded-none! shrink-0 overflow-y-scroll border-t border-tint-subtle pl-6 pr-5"
        >
            <div className="line-clamp-1">
                {t(language, 'ai_chat_ask_query', assistant.label, query)}
            </div>
        </SearchResultItem>
    );
}
