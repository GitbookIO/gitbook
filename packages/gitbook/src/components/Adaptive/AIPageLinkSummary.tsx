'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { Icon } from '@gitbook/icons';
import { useEffect } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { Loading } from '../primitives';
import { streamLinkPageSummary } from './server-actions/streamLinkPageSummary';

/**
 * Get a unique cache key for a page summary
 */
function getCacheKey(targetSpaceId: string, targetPageId: string): string {
    return `${targetSpaceId}:${targetPageId}`;
}

/**
 * Global state for the summaries.
 */
const useSummaries = create<{
    /**
     * Cache of all summaries generated so far.
     */
    cache: Map<string, string>;

    /**
     * Get a summary for a page.
     */
    getSummary: (params: { targetSpaceId: string; targetPageId: string }) => string;

    /**
     * Stream the generation of a summary for a page.
     */
    streamSummary: (params: {
        currentSpaceId: string;
        currentPageId: string;
        currentPageTitle: string;
        targetSpaceId: string;
        targetPageId: string;
        linkPreview?: string;
        linkTitle?: string;
        visitedPages: { spaceId: string; pageId: string }[];
    }) => Promise<void>;
}>((set, get) => ({
    cache: new Map(),

    getSummary: ({
        targetSpaceId,
        targetPageId,
    }: {
        targetSpaceId: string;
        targetPageId: string;
    }) => {
        return get().cache.get(getCacheKey(targetSpaceId, targetPageId)) ?? '';
    },

    streamSummary: async ({
        currentSpaceId,
        currentPageId,
        currentPageTitle,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        visitedPages,
    }) => {
        const cacheKey = getCacheKey(targetSpaceId, targetPageId);

        if (get().cache.has(cacheKey)) {
            // Already generated or generating
            return;
        }

        const update = (summary: string) => {
            set((prev) => {
                const newCache = new Map(prev.cache);
                newCache.set(cacheKey, summary);
                return { cache: newCache };
            });
        };

        update('');
        const stream = await streamLinkPageSummary({
            currentSpaceId,
            currentPageId,
            currentPageTitle,
            targetSpaceId,
            targetPageId,
            linkPreview,
            linkTitle,
            visitedPages,
        });

        let generatedSummary = '';
        for await (const highlight of stream) {
            generatedSummary = highlight ?? '';
            update(generatedSummary);
        }
    },
}));

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
    const { summary, streamSummary } = useSummaries(
        useShallow((state) => {
            return {
                summary: state.getSummary({ targetSpaceId, targetPageId }),
                streamSummary: state.streamSummary,
            };
        })
    );

    useEffect(() => {
        streamSummary({
            currentSpaceId: currentPage.spaceId,
            currentPageId: currentPage.pageId,
            currentPageTitle: currentPage.title,
            targetSpaceId,
            targetPageId,
            linkPreview,
            linkTitle,
            visitedPages,
        });
    }, [
        currentPage.pageId,
        currentPage.spaceId,
        currentPage.title,
        targetSpaceId,
        targetPageId,
        linkPreview,
        linkTitle,
        visitedPages,
        streamSummary,
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
