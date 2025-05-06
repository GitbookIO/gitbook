'use client';
import { useEffect, useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { useAdaptiveContext } from './AdaptiveContext';
import { streamPageSummary } from './server-actions/streamPageSummary';

export function AIPageSummary() {
    const { open } = useAdaptiveContext();

    const currentPage = usePageContext();
    const visitedPages = useVisitedPages((state) => state.pages);

    const [summary, setSummary] = useState<{
        pageSummary?: string;
        bigPicture?: string;
    }>({});

    useEffect(() => {
        let canceled = false;

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
        })();

        return () => {
            canceled = true;
        };
    }, [currentPage, visitedPages]);

    return (
        open && (
            <div className="flex animate-fadeIn flex-col gap-4">
                {summary.pageSummary ? (
                    <div>
                        <h5 className="mb-1 font-semibold text-tint-subtle text-xs uppercase">
                            Key facts
                        </h5>
                        {summary.pageSummary}
                    </div>
                ) : null}

                {visitedPages.length > 1 && summary?.bigPicture ? (
                    <div>
                        <h5 className="mb-1 font-semibold text-tint-subtle text-xs uppercase">
                            Big Picture
                        </h5>
                        {summary?.bigPicture}
                    </div>
                ) : null}
            </div>
        )
    );
}
