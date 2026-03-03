'use client';

import { tcls } from '@/lib/tailwind';
import { Emoji } from '../primitives/Emoji/Emoji';
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
        <a
            href={result.url}
            className={tcls(
                'flex',
                'flex-col',
                'gap-1',
                'p-3',
                'rounded-corners:rounded-lg',
                'circular-corners:rounded-2xl',
                'bg-tint-subtle',
                'hover:bg-tint',
                'transition-all',
                'duration-300',
                'cursor-pointer',
                fetching ? ['basis-[calc(50%-4px)]', 'min-w-0'] : ['w-40', 'shrink-0']
            )}
        >
            <div className={tcls('flex', 'flex-row', 'items-center', 'gap-1.5', 'min-w-0')}>
                {result.icon ? (
                    <Emoji code={result.icon} style="shrink-0 text-base leading-none" />
                ) : null}
                <p className="truncate font-semibold text-sm text-tint-strong leading-snug">
                    {result.title}
                </p>
            </div>
            {result.description ? (
                <p className="line-clamp-2 text-tint text-xs leading-snug">{result.description}</p>
            ) : null}
        </a>
    );
}
