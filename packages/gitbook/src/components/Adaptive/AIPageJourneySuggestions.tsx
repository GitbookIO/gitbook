'use client';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { useEffect } from 'react';
import { useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { streamPageJourneySuggestions } from './server-actions';

export function AIPageJourneySuggestions(props: { spaces: { id: string; title: string }[] }) {
    const { spaces } = props;

    const currentPage = usePageContext();

    // const language = useLanguage();
    const visitedPages = useVisitedPages((state) => state.pages);
    const [journeys, setJourneys] = useState<({ label?: string; icon?: string } | undefined)[]>([]);

    useEffect(() => {
        let canceled = false;

        (async () => {
            const stream = await streamPageJourneySuggestions({
                currentPage: {
                    id: currentPage.pageId,
                    title: currentPage.title,
                },
                currentSpace: {
                    id: currentPage.spaceId,
                },
                allSpaces: spaces,
                visitedPages,
            });

            for await (const journeys of stream) {
                if (canceled) return;
                setJourneys(journeys);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [currentPage.pageId, currentPage.spaceId, visitedPages, spaces]);

    const shimmerBlocks = [
        '[animation-delay:-.2s]',
        '[animation-delay:-.4s]',
        '[animation-delay:-.6s]',
        '[animation-delay:-.8s]',
    ];

    return (
        <div className="grid w-72 grid-cols-2 gap-2 text-sm">
            {shimmerBlocks.map((block, i) =>
                journeys[i]?.icon ? (
                    <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: The index is the only identifier available, since we don't know the content of the block until it's loaded in.
                        key={i}
                        className="flex animate-fadeIn flex-col items-center justify-center gap-2 rounded border border-tint px-2 py-4 text-center [animation-delay:.2s] [animation-fill-mode:both]"
                    >
                        <Icon
                            icon={journeys[i].icon as IconName}
                            className="size-4 text-tint-subtle"
                        />
                        {journeys[i].label}
                    </div>
                ) : (
                    <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: The index is the only identifier available, since we don't know the content of the block until it's loaded in.
                        key={i}
                        className={tcls(
                            'h-24 animate-pulse rounded-md straight-corners:rounded-none border border-tint-subtle',
                            block
                        )}
                    />
                )
            )}
        </div>
    );
}
