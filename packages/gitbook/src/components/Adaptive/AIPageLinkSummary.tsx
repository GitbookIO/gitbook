'use client';
import { Icon } from '@gitbook/icons';
import { useEffect, useState } from 'react';
import { useVisitedPages } from '../Insights';
import { Loading } from '../primitives';
import { streamLinkPageSummary } from './server-actions/streamLinkPageSummary';

/**
 * Summarise a page's content for use in a link preview
 */
export function AIPageLinkSummary(props: {
    currentSpaceId: string;
    currentPageId: string;
    currentPageTitle: string;
    targetSpaceId: string;
    targetPageId: string;
    linkPreview?: string;
    linkTitle?: string;
    showTrademark: boolean;
}) {
    const {
        currentSpaceId,
        currentPageId,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        showTrademark = true,
    } = props;

    const visitedPages = useVisitedPages((state) => state.pages);
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
                linkTitle,
                visitedPages,
            });

            for await (const highlight of stream) {
                if (canceled) return;
                setHighlight(highlight ?? '');
            }
        })();

        return () => {
            canceled = true;
        };
    }, [
        currentSpaceId,
        currentPageId,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        visitedPages,
    ]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex w-screen items-center gap-1 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
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
