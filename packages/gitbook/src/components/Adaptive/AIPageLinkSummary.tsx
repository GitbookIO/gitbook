'use client';
import { Icon } from '@gitbook/icons';
import { useEffect, useState } from 'react';
import { Loading } from '../primitives';
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
    showTrademark: boolean;
}) {
    const {
        currentSpaceId,
        currentPageId,
        targetSpaceId,
        targetPageId,
        linkPreview,
        showTrademark = true,
    } = props;

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

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
                {showTrademark ? (
                    <Loading className="size-4" busy={!highlight || highlight.length === 0} />
                ) : (
                    <Icon icon="sparkle" className="size-3" />
                )}
                <h6 className="text-tint">Page highlight</h6>
            </div>
            {highlight.length > 0 ? <p>{highlight}</p> : null}
            {highlight.length > 0 ? (
                <div className="text-tint-subtle text-xs">
                    Based on your context. May contain mistakes.
                </div>
            ) : null}
        </div>
    );
}
