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

    const [pages, setPages] = useState<SuggestedPage[]>(selectedJourney?.pages ?? []);
    const [suggestedPages, setSuggestedPages] = useState<SuggestedPage[]>([]);

    useEffect(() => {
        let canceled = false;

        if (selectedJourney?.pages && selectedJourney.pages.length > 0) {
            setPages(selectedJourney.pages);
        } else {
            setPages(suggestedPages);
        }

        if (suggestedPages.length === 0) {
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

                    setPages((prev) => [...prev, page]);
                    setSuggestedPages((prev) => [...prev, page]);
                }
            })();
        }

        return () => {
            canceled = true;
        };
    }, [
        selectedJourney,
        currentPage.pageId,
        currentPage.spaceId,
        currentPage.title,
        visitedPages,
        suggestedPages,
    ]);

    return (
        open && (
            <div className="animate-fadeIn">
                <motion.div className="mb-2 flex flex-row items-start gap-3">
                    <AnimatePresence mode="wait">
                        {selectedJourney?.icon ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: 0.2 }}
                                key={selectedJourney.icon}
                            >
                                <Icon
                                    icon={selectedJourney.icon as IconName}
                                    className="left-0 mt-2 size-6 shrink-0 text-tint-subtle"
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                    <motion.div className={tcls('flex flex-col')} layout="position">
                        <div className="font-semibold text-tint text-xs uppercase tracking-wide">
                            Suggested pages
                        </div>
                        <AnimatePresence mode="wait">
                            {selectedJourney?.label ? (
                                <motion.h5
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={selectedJourney.label}
                                    className="font-semibold text-base"
                                >
                                    {selectedJourney.label}
                                </motion.h5>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
                <div className="-mb-1.5 flex flex-col gap-1">
                    {Object.assign(Array.from({ length: 5 }), pages).map(
                        (page: SuggestedPage | undefined, index) =>
                            page ? (
                                <Link
                                    key={`${selectedJourney?.label}-${page.id}`}
                                    className="-mx-2 flex animate-fadeIn gap-2 rounded px-2.5 py-1 transition-all hover:bg-tint-hover hover:text-tint-strong"
                                    href={page.href}
                                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                                >
                                    {page.icon ? (
                                        <Icon
                                            icon={page.icon as IconName}
                                            className="mt-0.5 size-4 shrink-0 text-tint-subtle"
                                        />
                                    ) : null}
                                    {page.emoji ? <Emoji code={page.emoji} /> : null}
                                    {page.title}
                                </Link>
                            ) : (
                                <div
                                    key={index}
                                    className="my-1 h-5 animate-pulse rounded bg-tint-hover"
                                    style={{
                                        animationDelay: `${index * 0.2}s`,
                                        width: `${((index * 17) % 50) + 50}%`,
                                    }}
                                />
                            )
                    )}
                </div>
            </div>
        )
    );
}
