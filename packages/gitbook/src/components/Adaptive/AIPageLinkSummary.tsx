'use client';
import { t } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations';
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
    language: TranslationLanguage;
}) {
    const {
        currentSpaceId,
        currentPageId,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        showTrademark = true,
        language,
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

    const shimmerBlocks = [
        'w-[20%] [animation-delay:-1s]',
        'w-[35%] [animation-delay:-0.8s]',
        'w-[25%] [animation-delay:-0.6s]',
        'w-[10%] [animation-delay:-0.4s]',
        'w-[40%] [animation-delay:-0.2s]',
        'w-[30%] [animation-delay:0s]',
    ];

    return (
        <div className="flex flex-col gap-1">
            <div className="flex w-screen items-center gap-1 font-semibold text-tint text-xs uppercase leading-tight tracking-wide">
                {showTrademark ? (
                    <Loading className="size-4" busy={!highlight || highlight.length === 0} />
                ) : (
                    <Icon icon="sparkle" className="size-3" />
                )}
                <h6 className="text-tint">{t(language, 'link_tooltip_ai_summary')}</h6>
            </div>
            {highlight.length > 0 ? (
                <p className="animate-fadeIn">{highlight}</p>
            ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                    {shimmerBlocks.map((block, index) => (
                        <div
                            key={`${index}-${block}`}
                            className={`${block} h-4 animate-pulse rounded straight-corners:rounded-none bg-tint-active`}
                        />
                    ))}
                </div>
            )}
            {highlight.length > 0 ? (
                <div className="animate-fadeIn text-tint-subtle text-xs">
                    {t(language, 'link_tooltip_ai_summary_description')}
                </div>
            ) : null}
        </div>
    );
}
