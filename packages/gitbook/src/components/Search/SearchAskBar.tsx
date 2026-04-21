'use client';

import type { Assistant } from '@/components/AI';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { Link } from '../primitives/Link';
import { useSearchLink } from './useSearch';

/**
 * Sticky single-line bar at the bottom of the search frame.
 * Clicking opens the AI assistant with the current query.
 */
export function SearchAskBar(props: { query: string; assistant: Assistant }) {
    const { query, assistant } = props;
    const language = useLanguage();
    const getSearchLinkProps = useSearchLink();

    const linkProps = getSearchLinkProps(
        {
            ask: query,
            query: null,
            open: assistant.mode === 'search',
        },
        () => {
            assistant.open(query);
        }
    );

    return (
        <Link
            {...linkProps}
            className={tcls(
                'flex items-center gap-3 px-6 py-2.5',
                'border-tint-subtle border-t bg-tint-base',
                'text-sm text-tint',
                'hover:bg-tint hover:text-tint-strong',
                'transition-colors'
            )}
            data-testid="search-ask-question"
        >
            <div className="size-4 shrink-0 text-tint-subtle">
                {typeof assistant.icon === 'string' ? (
                    <Icon icon={assistant.icon as IconName} className="size-4" />
                ) : (
                    assistant.icon
                )}
            </div>
            <span className="truncate">
                {`${tString(language, 'ask', '')} ${assistant.label} "${query}"`}
            </span>
            <Icon icon="chevron-right" className="mr-4 ml-auto size-3 text-tint-subtle" />
        </Link>
    );
}
