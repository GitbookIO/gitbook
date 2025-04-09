'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { Icon } from '@gitbook/icons';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { Loading } from '../primitives';
import { streamLinkPageSummary } from './server-actions/streamLinkPageSummary';

const useSummaries = create<{
    cache: Map<string, string>;
    setSummary: (key: string, summary: string) => void;
}>((set) => ({
    cache: new Map(),
    setSummary: (key, summary) =>
        set((state) => {
            const newCache = new Map(state.cache);
            newCache.set(key, summary);
            return { cache: newCache };
        }),
}));

/**
 * Get a unique cache key for a page summary
 */
function getCacheKey(targetSpaceId: string, targetPageId: string): string {
    return `${targetSpaceId}:${targetPageId}`;
}

/**
 * Summarise a page's content for use in a link preview
 */
export function AIPageLinkSummary(props: {
    targetSpaceId: string;
    targetPageId: string;
    linkPreview?: string;
    linkTitle?: string;
    showTrademark: boolean;
}) {
    const { targetSpaceId, targetPageId, linkPreview, linkTitle, showTrademark = true } = props;

    const currentPage = usePageContext();
    const language = useLanguage();
    const visitedPages = useVisitedPages((state) => state.pages);
    const [summary, setSummary] = useState('');
    const cacheKey = getCacheKey(targetSpaceId, targetPageId);
    const { cachedSummary, setCachedSummary } = useSummaries(
        useShallow((state) => {
            return {
                cachedSummary: state.cache.get(cacheKey) ?? '',
                setCachedSummary: state.setSummary,
            };
        })
    );

    useEffect(() => {
        let canceled = false;

        setSummary('');

        if (cachedSummary) {
            setSummary(cachedSummary);
            return;
        }

        (async () => {
            const stream = await streamLinkPageSummary({
                currentSpaceId: currentPage.spaceId,
                currentPageId: currentPage.pageId,
                currentPageTitle: currentPage.title,
                targetSpaceId,
                targetPageId,
                linkPreview,
                linkTitle,
                visitedPages,
            });

            let generatedSummary = '';
            for await (const highlight of stream) {
                if (canceled) return;
                generatedSummary = highlight ?? '';
                setSummary(generatedSummary);
            }

            // Cache the complete summary
            if (generatedSummary) {
                setCachedSummary(cacheKey, generatedSummary);
            }
        })();

        return () => {
            canceled = true;
        };
    }, [
        currentPage.pageId,
        currentPage.spaceId,
        currentPage.title,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        visitedPages,
        cachedSummary,
        cacheKey,
        setCachedSummary,
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
                    <Loading className="size-4" busy={!summary || summary.length === 0} />
                ) : (
                    <Icon icon="sparkle" className="size-3" />
                )}
                <h6 className="text-tint">{t(language, 'link_tooltip_ai_summary')}</h6>
            </div>
            {summary.length > 0 ? (
                <p className="animate-fadeIn">{summary}</p>
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
            {summary.length > 0 ? (
                <div className="animate-fadeIn text-tint-subtle text-xs">
                    {t(language, 'link_tooltip_ai_summary_description')}
                </div>
            ) : null}
        </div>
    );
}
