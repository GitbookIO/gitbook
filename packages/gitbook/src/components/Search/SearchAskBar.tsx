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
                'flex items-center gap-3 px-4 py-1.5',
                'border-tint-subtle border-t bg-tint-subtle',
                'text-sm text-tint',
                'hover:bg-tint-hover hover:text-tint-strong',
                'transition-colors',
                'rounded-corners:rounded-b-md'
            )}
        >
            <div className="size-4 shrink-0 text-tint-subtle">
                {typeof assistant.icon === 'string' ? (
                    <Icon icon={assistant.icon as IconName} className="size-4" />
                ) : (
                    assistant.icon
                )}
            </div>
            <span className="truncate">
                {tString(language, 'ask', '')}{' '}
                <span className="font-medium text-tint-strong">{assistant.label}</span>{' '}
                <span className="text-tint-subtle">"{query}"</span>
            </span>
            <Icon icon="chevron-right" className="ml-auto size-3 shrink-0 text-tint-subtle" />
        </Link>
    );
}
