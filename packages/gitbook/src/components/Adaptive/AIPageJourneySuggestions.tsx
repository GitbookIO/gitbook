'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import Link from 'next/link';
import { useEffect } from 'react';
import { useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { streamPageJourneySuggestions } from './server-actions';

const JOURNEY_COUNT = 4;

export function AIPageJourneySuggestions(props: { spaces: { id: string; title: string }[] }) {
    const { spaces } = props;

    const currentPage = usePageContext();

    // const language = useLanguage();
    const visitedPages = useVisitedPages((state) => state.pages);
    const [journeys, setJourneys] = useState<
        Array<{
            label: string;
            icon?: string;
            pages?: Array<{
                id: string;
                title: string;
                href: string;
                icon?: string;
                emoji?: string;
            }>;
        }>
    >(Array.from({ length: JOURNEY_COUNT }));
    const [selected, setSelected] = useState<
        | {
              label: string;
              icon?: string;
              pages?: Array<{
                  id: string;
                  title: string;
                  href: string;
                  icon?: string;
                  emoji?: string;
              }>;
          }
        | undefined
    >();

    useEffect(() => {
        let canceled = false;

        (async () => {
            const stream = await streamPageJourneySuggestions({
                count: JOURNEY_COUNT,
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

            for await (const journey of stream) {
                if (canceled) return;

                // Find the first empty slot in the journeys array
                setJourneys((prev) => {
                    const newJourneys = [...prev];
                    const emptyIndex = newJourneys.findIndex((j) => !j?.label);
                    if (emptyIndex >= 0) {
                        newJourneys[emptyIndex] = journey;
                    }
                    return newJourneys;
                });
            }
        })();

        return () => {
            canceled = true;
        };
    }, [currentPage.pageId, currentPage.spaceId, currentPage.title, visitedPages, spaces]);

    return (
        <div>
            <div className="grid w-72 grid-cols-2 gap-2 text-sm">
                {journeys.map((journey, i) => (
                    <button
                        type="button"
                        key={i}
                        disabled={journey?.label === undefined}
                        className={tcls(
                            'flex flex-col items-center justify-center gap-2 rounded border border-tint-subtle px-2 py-4 text-center transition-all duration-500 *:animate-fadeIn *:delay-200',
                            journey?.label === undefined
                                ? 'h-24 scale-90 animate-pulse'
                                : 'duration-300 hover:border-tint hover:bg-tint-active hover:text-tint-strong',
                            journey?.label &&
                                journey.label === selected?.label &&
                                'border-tint bg-tint-active text-tint-strong'
                        )}
                        style={{
                            animationDelay: `${i * -0.2}s`,
                        }}
                        onClick={() => setSelected(journey)}
                    >
                        {journey?.icon ? (
                            <Icon
                                icon={journey.icon as IconName}
                                className="size-4 text-tint-subtle"
                            />
                        ) : null}
                        {journey?.label}
                    </button>
                ))}
            </div>
            {selected && (
                <div className="mt-6 animate-present text-sm [animation-duration:1000ms]">
                    <h3 className="font-bold text-base">
                        {selected.icon ? (
                            <Icon
                                icon={selected.icon as IconName}
                                className="mr-2 inline size-5 text-tint-subtle"
                            />
                        ) : null}
                        {selected.label}
                    </h3>
                    <ol className="mt-2 ml-2 flex flex-col gap-2 border-tint-subtle border-l pl-5">
                        {selected.pages?.map((page, index) => (
                            <li
                                key={selected.label + page.id}
                                className="animate-fadeIn [animation-duration:500ms]"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Link href={page.href} className="flex gap-2">
                                    <Icon icon={page.icon as IconName} className="size-4" />
                                    {page.title}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
