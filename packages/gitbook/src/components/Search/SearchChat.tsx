'use client';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';
import { Icon } from '@gitbook/icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useVisitedPages } from '../Insights/useVisitedPages';
import { Button } from '../primitives';
import { isQuestion } from './isQuestion';
import { streamAISearchAnswer, streamAISearchSummary } from './server-actions';

export function SearchChat(props: { query: string }) {
    // const currentPage = usePageContext();
    // const language = useLanguage();

    const { query } = props;

    const visitedPages = useVisitedPages((state) => state.pages);
    const [summary, setSummary] = useState('');
    const [messages, setMessages] = useState<
        { role: string; content?: string; fetching?: boolean }[]
    >([]);
    const [followupQuestions, setFollowupQuestions] = useState<string[]>();

    const [responseId, setResponseId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const stream = await streamAISearchSummary({
                visitedPages,
            });

            for await (const data of stream) {
                if (cancelled) return;

                if ('responseId' in data && data.responseId !== undefined) {
                    setResponseId(data.responseId);
                }

                if ('summary' in data && data.summary !== undefined) {
                    setSummary(data.summary);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visitedPages]);

    useEffect(() => {
        let cancelled = false;

        if (query) {
            setMessages([
                {
                    role: 'user',
                    content: query,
                },
                {
                    role: 'assistant',
                    fetching: true,
                },
            ]);

            (async () => {
                const stream = await streamAISearchAnswer({
                    question: query,
                    previousResponseId: responseId ?? undefined,
                });

                for await (const data of stream) {
                    if (cancelled) return;

                    if ('responseId' in data && data.responseId !== undefined) {
                        setResponseId(data.responseId);
                    }

                    if ('answer' in data && data.answer !== undefined) {
                        setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { role: 'assistant', content: data.answer, fetching: false },
                        ]);
                    }

                    if ('followupQuestions' in data && data.followupQuestions !== undefined) {
                        setFollowupQuestions(data.followupQuestions.filter(filterOutNullable));
                    }
                }
            })();

            return () => {
                cancelled = true;
            };
        }
    }, [query, responseId]);

    return (
        <motion.div layout="position" className="relative mx-auto h-full p-8">
            <div className="mx-auto flex w-full max-w-prose flex-col gap-4">
                <div>
                    <h5 className="mb-1 flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                        <Icon icon="glasses-round" className="mt-0.5 size-3" /> Summary of what
                        you've read
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
                </div>

                {messages.map((message) => (
                    <div
                        key={message.content}
                        className={tcls(
                            'flex flex-col gap-1',
                            message.role === 'user' && 'items-end gap-1 self-end'
                        )}
                    >
                        {message.role === 'user' ? (
                            <h5 className="flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                                You asked {isQuestion(query) ? '' : 'about'}
                            </h5>
                        ) : (
                            <h5 className="flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                                <Icon icon="sparkle" className="mt-0.5 size-3" /> AI Answer
                            </h5>
                        )}
                        {message.fetching ? (
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
                        ) : (
                            <div
                                className={tcls(
                                    message.role === 'user' && 'rounded-lg bg-tint-active px-4 py-2'
                                )}
                            >
                                {message.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {query ? (
                <div className="absolute inset-x-0 bottom-0 border-tint-subtle border-t bg-tint-subtle px-8 py-4">
                    <div className="mx-auto flex w-full max-w-prose flex-col gap-2">
                        {followupQuestions && followupQuestions.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {followupQuestions?.map((question) => (
                                    <div
                                        className="whitespace-nowrap rounded straight-corners:rounded-sm border border-tint-subtle bg-tint-base px-2 py-1 text-sm"
                                        key={question}
                                    >
                                        {question}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask a follow-up question"
                                className="grow rounded px-4 py-1 ring-1 ring-tint-subtle"
                            />
                            <Button
                                label="Send"
                                iconOnly
                                icon="arrow-up"
                                size="medium"
                                className="shrink-0"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
}
