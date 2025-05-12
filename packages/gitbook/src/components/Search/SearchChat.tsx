'use client';
import { Icon } from '@gitbook/icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useVisitedPages } from '../Insights/useVisitedPages';
import { streamAISearchSummary } from './server-actions';

export function SearchChat() {
    // const currentPage = usePageContext();
    // const language = useLanguage();
    const visitedPages = useVisitedPages((state) => state.pages);
    const [summary, setSummary] = useState('');
    const [responseId, setResponseId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const stream = await streamAISearchSummary({
                visitedPages,
            });

            let generatedSummary = '';
            for await (const data of stream) {
                if (cancelled) return;

                if ('responseId' in data && data.responseId !== undefined) {
                    setResponseId(data.responseId);
                }

                if ('summary' in data && data.summary !== undefined) {
                    generatedSummary = data.summary;
                    setSummary(generatedSummary);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visitedPages]);

    return (
        <motion.div layout="position" className="w-full">
            <h5 className="mb-1 flex items-center gap-1 font-semibold text-sm text-tint-subtle">
                <Icon icon="glasses-round" className="mt-0.5 size-4" /> Summary of what you've read
            </h5>

            {summary ? (
                summary
            ) : (
                <div key="loading" className="mt-2 flex flex-wrap gap-2">
                    {[...Array(9)].map((_, index) => (
                        <div
                            key={index}
                            className="h-4 animate-[fadeIn_0.5s_ease-in-out_both,pulse_2s_ease-in-out_infinite] rounded straight-corners:rounded-none bg-tint-active"
                            style={{
                                animationDelay: `${index * 0.1}s,${0.5 + index * 0.1}s`,
                                width: `${((index % 5) + 1) * 15}%`,
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
