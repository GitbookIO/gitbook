'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { Emoji } from '../primitives';
import { type SuggestedPage, useAdaptiveContext } from './AdaptiveContext';
import { streamNextPageSuggestions } from './server-actions/streamNextPageSuggestions';

export function AINextPageSuggestions() {
    const { selectedJourney, open } = useAdaptiveContext();

    const currentPage = usePageContext();
    const visitedPages = useVisitedPages((state) => state.pages);

    const [pages, setPages] = useState<SuggestedPage[]>(
        selectedJourney?.pages ?? Array.from({ length: 5 })
    );

    useEffect(() => {
        let canceled = false;

        if (selectedJourney?.pages && selectedJourney.pages.length > 0) {
            setPages(selectedJourney.pages);
        }

        (async () => {
            const stream = await streamNextPageSuggestions({
                currentPage: {
                    id: currentPage.pageId,
                    title: currentPage.title,
                },
                currentSpace: {
                    id: currentPage.spaceId,
                },
                visitedPages: visitedPages,
            });

            for await (const page of stream) {
                if (canceled) return;

                setPages((prev) => {
                    const newPages = [...prev];
                    const emptyIndex = newPages.findIndex((j) => !j?.id);
                    if (emptyIndex >= 0) {
                        newPages[emptyIndex] = page;
                    }
                    return newPages;
                });
            }
        })();

        return () => {
            canceled = true;
        };
    }, [selectedJourney, currentPage.pageId, currentPage.spaceId, currentPage.title, visitedPages]);

    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.div
                    key="next-page-suggestions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <div className="relative mb-2 flex flex-row items-center gap-3">
                        {selectedJourney?.icon ? (
                            <Icon
                                key={selectedJourney.icon}
                                icon={selectedJourney.icon as IconName}
                                className="absolute left-0 size-6 animate-scaleIn text-tint-subtle [animation-delay:100ms]"
                            />
                        ) : null}
                        <div
                            className={tcls(
                                'flex flex-col transition-all',
                                selectedJourney?.icon ? 'ml-9' : 'delay-0'
                            )}
                        >
                            <div className="flex flex-row items-center gap-2 font-semibold text-tint text-xs uppercase tracking-wide">
                                Suggested pages
                            </div>
                            {selectedJourney?.label ? (
                                <h5
                                    key={selectedJourney.label}
                                    className="animate-fadeIn font-semibold text-base"
                                >
                                    {selectedJourney.label}
                                </h5>
                            ) : null}
                        </div>
                    </div>
                    <div className="-mb-1.5 flex flex-col gap-1">
                        {pages.map((page, index) =>
                            page?.id ? (
                                <Link
                                    key={selectedJourney?.label + page.id}
                                    className="-mx-2 flex animate-fadeIn gap-2 rounded px-2.5 py-1 transition-all hover:bg-tint-hover hover:text-tint-strong"
                                    href={page.href}
                                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                                >
                                    {page.icon ? (
                                        <Icon
                                            icon={page.icon as IconName}
                                            className="mt-0.5 size-4 text-tint-subtle"
                                        />
                                    ) : null}
                                    {page.emoji ? <Emoji code={page.emoji} /> : null}
                                    {page.title}
                                </Link>
                            ) : (
                                <div
                                    key={index}
                                    className="my-1 h-5 animate-pulse rounded bg-tint-hover"
                                    style={{ animationDelay: `${index * 0.2}s`, width: `${(((index * 17) % 50) + 50)}%` }}
                                />
                            )
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
