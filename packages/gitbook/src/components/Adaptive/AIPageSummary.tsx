'use client';
import { useEffect, useRef, useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { useAdaptiveContext } from './AdaptiveContext';
import { streamPageSummary } from './server-actions/streamPageSummary';

export function AIPageSummary() {
    const { toggle, setLoading, setToggle } = useAdaptiveContext();

    const currentPage = usePageContext();
    const visitedPages = useVisitedPages((state) => state.pages);
    const visitedPagesRef = useRef(visitedPages);

    const [summary, setSummary] = useState<{
        pageSummary?: string;
        bigPicture?: string;
    }>({});

    useEffect(() => {
        if (!visitedPages?.length) return;

        // Skip if the visited pages haven't changed
        if (JSON.stringify(visitedPagesRef.current) === JSON.stringify(visitedPages)) return;

        visitedPagesRef.current = visitedPages;

        let canceled = false;
        setLoading(true);

        (async () => {
            const stream = await streamPageSummary({
                currentPage: {
                    id: currentPage.pageId,
                    title: currentPage.title,
                },
                currentSpace: {
                    id: currentPage.spaceId,
                },
                visitedPages: visitedPages,
            });

            for await (const summary of stream) {
                if (canceled) return;

                setSummary(summary);
            }
        })().finally(() => {
            setLoading(false);
            if (!toggle.manual) {
                setToggle({
                    open: true,
                    manual: false,
                });
            }
        });

        return () => {
            canceled = true;
        };
    }, [currentPage, visitedPages, toggle, setLoading, setToggle]);

    const shimmerBlocks = [20, 35, 25, 10, 45, 30, 30, 35, 25, 10, 40, 30]; // Widths in percentages

    return (
        toggle.open && (
            <div className="flex animate-fadeIn flex-col gap-4">
                {summary.pageSummary ? (
                    <div>
                        <h5 className="mb-0.5 font-semibold text-tint-subtle text-xs uppercase">
                            Key facts
                        </h5>
                        {summary.pageSummary}
                    </div>
                ) : (
                    <div className="flex w-full flex-wrap gap-2">
                        {shimmerBlocks.map((width, index) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: No other distinguishing feature available
                                key={index}
                                className="h-4 animate-pulse rounded bg-tint-active"
                                style={{
                                    width: `${width}%`,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {visitedPages.length > 1 && summary?.bigPicture ? (
                    <div>
                        <h5 className="mb-0.5 font-semibold text-tint-subtle text-xs uppercase">
                            Big Picture
                        </h5>
                        {summary?.bigPicture}
                    </div>
                ) : null}
            </div>
        )
    );
}
