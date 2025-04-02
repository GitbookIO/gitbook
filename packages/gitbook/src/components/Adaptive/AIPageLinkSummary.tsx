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
    linkPreview?: string;
}) {
    const { currentSpaceId, currentPageId, targetSpaceId, targetPageId, linkPreview } = props;

    const [highlight, setHighlight] = useState('');

    useEffect(() => {
        let canceled = false;

        setHighlight('');

        (async () => {
            const stream = await streamLinkPageSummary({
                currentSpaceId,
                currentPageId,
                targetSpaceId,
                targetPageId,
                linkPreview,
                previousPageIds: [],
            });

            for await (const highlight of stream) {
                if (canceled) return;

                // join the chunk if it's an array of strings or string|undefined
                // console.log(summary[0]);
                setHighlight(highlight ?? '');
            }
        })();

        return () => {
            canceled = true;
        };
    }, [currentSpaceId, currentPageId, targetSpaceId, targetPageId]);

    return <p>{highlight.length > 1 ? highlight : "Loading..."}</p>;
}
