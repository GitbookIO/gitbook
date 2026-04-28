'use client';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { Emoji } from '../primitives/Emoji/Emoji';
import { Link } from '../primitives/Link';
import type { LocalPageResult } from './useLocalSearchResults';

/**
 * Renders local search results above the main server results.
 *
 * Layout:
 * - While server results are still fetching → 2-column wrapping row (cards fill width)
 * - Once server results are ready → single horizontal scrollable row (fixed-width cards)
 *
 * The card width is CSS-transitioned so the switch between the two layouts animates smoothly.
 */
export function LocalSearchResults({
    results,
    fetching,
}: {
    results: LocalPageResult[];
    fetching: boolean;
}) {
    if (results.length === 0) return null;

    return (
        <div
            className={tcls(
                'py-2',
                'flex',
                'flex-row',
                'gap-2',
                fetching
                    ? 'flex-wrap'
                    : ['overflow-x-auto', '[scrollbar-width:none]', '[&::-webkit-scrollbar]:hidden']
            )}
        >
            {results.map((result) => (
                <LocalSearchResultCard key={result.id} result={result} fetching={fetching} />
            ))}
        </div>
    );
}

function LocalSearchResultCard({
    result,
    fetching,
}: {
    result: LocalPageResult;
    fetching: boolean;
}) {
    return (
        <Link
            href={result.pathname}
            className={tcls(
                'group',
                'flex',
                'flex-col',
                'gap-1',
                'p-3',
                'rounded-corners:rounded-lg',
                'circular-corners:rounded-2xl',
                'text-tint',
                'bg-tint-subtle',
                'hover:bg-tint',
                'hover:text-tint-strong',
                'transition-colors',
                'cursor-pointer',
                fetching ? ['basis-[calc(50%-4px)]', 'min-w-0'] : ['w-40', 'shrink-0']
            )}
        >
            <div className={tcls('flex', 'flex-row', 'items-center', 'gap-1.5', 'min-w-0')}>
                {result.emoji ? (
                    <span className="size-4 shrink-0 text-tint-subtle">
                        <Emoji code={result.emoji} style="text-base leading-none" />
                    </span>
                ) : result.icon ? (
                    <span className="size-4 shrink-0 text-tint-subtle">
                        <Icon icon={result.icon as IconName} className="size-4" />
                    </span>
                ) : null}
                <p className="grow truncate font-semibold text-sm text-tint-strong leading-snug">
                    {result.title}
                </p>
                <span className="ml-auto shrink-0 text-tint-subtle">
                    <Icon icon="chevron-right" className="size-3" />
                </span>
            </div>
            {result.description ? (
                <p className="line-clamp-2 text-xs leading-snug">{result.description}</p>
            ) : null}
        </Link>
    );
}
