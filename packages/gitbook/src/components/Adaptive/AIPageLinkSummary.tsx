'use client';
import { useEffect, useState } from 'react';
import { streamLinkPageSummary } from './server-actions/streamLinkPageSummary';

/**
 * Summarise a page's content for use in a link preview
 */
export function AIPageLinkSummary(props: {
    currentSpaceId: string;
    currentPageId: string;
    targetSpaceId: string;
    targetPageId: string;
}) {
    const { currentSpaceId, currentPageId, targetSpaceId, targetPageId } = props;

    const [summary, setSummary] = useState('');

    useEffect(() => {
        let canceled = false;

        setSummary('');

        (async () => {
            const stream = await streamLinkPageSummary({
                currentSpaceId,
                currentPageId,
                targetSpaceId,
                targetPageId,
                previousPageIds: [],
            });

            for await (const [summary] of stream) {
                if (canceled) return;

                // join the chunk if it's an array of strings or string|undefined
                // console.log(summary[0]);
                setSummary(summary ?? '');
            }
        })();

        return () => {
            canceled = true;
        };
    }, [currentSpaceId, currentPageId, targetSpaceId, targetPageId]);

    return <p>{summary.length > 1 ? summary : "Loading..."}</p>;
}
