'use client';

import type { Assistant } from '@/components/AI';
import { t, tString, useLanguage } from '@/intl/client';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { SearchResultItem } from './SearchResultItem';
import { useSearchLink } from './useSearch';

/**
 * Sticky single-line bar at the bottom of the search frame.
 * Clicking opens the AI assistant with the current query.
 */
export function SearchAskBar(props: {
    query: string;
    assistant: Assistant;
    active?: boolean;
    withShortcut?: boolean;
    onSelect?: () => void;
}) {
    const { query, assistant, active = false, withShortcut = false, onSelect } = props;
    const language = useLanguage();
    const getSearchLinkProps = useSearchLink();

    const linkProps = getSearchLinkProps(
        {
            ask: query,
            query: null,
            open: assistant.mode === 'search',
        },
        () => {
            onSelect?.();
            assistant.open(query);
        }
    );

    return (
        <SearchResultItem
            {...linkProps}
            active={active}
            action={tString(language, 'ask')}
            leadingIcon={assistant.icon}
            className="gutter-stable shrink-0 overflow-y-scroll rounded-none! border-tint-subtle border-t pr-5 pl-6"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="line-clamp-1">
                    {t(language, 'ai_chat_ask_query', assistant.label, query)}
                </div>
                {withShortcut ? (
                    <KeyboardShortcut className="bg-tint-base" keys={['mod', 'i']} />
                ) : null}
            </div>
        </SearchResultItem>
    );
}
