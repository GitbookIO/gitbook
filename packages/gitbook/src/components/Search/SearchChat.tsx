'use client';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';
import { Icon } from '@gitbook/icons';
import { useEffect, useRef, useState } from 'react';
import { useVisitedPages } from '../Insights/useVisitedPages';
import { Button } from '../primitives';
import { isQuestion } from './isQuestion';
import { streamAISearchAnswer, streamAISearchSummary } from './server-actions';
import { useSearch } from './useSearch';

export function SearchChat(props: { query: string }) {
    // const currentPage = usePageContext();
    // const language = useLanguage();

    const { query } = props;

    const visitedPages = useVisitedPages((state) => state.pages);
    const [summary, setSummary] = useState('');
    const [messages, setMessages] = useState<
        { role: string; content?: string; context?: string; fetching?: boolean }[]
    >([]);
    const [followupQuestions, setFollowupQuestions] = useState<string[]>();

    const [responseId, setResponseId] = useState<string | null>(null);
    const [searchState, setSearchState] = useSearch();

    const containerRef = useRef<HTMLDivElement>(null);
    const latestMessageRef = useRef<HTMLDivElement>(null);

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
                    role: 'assistant',
                    context: `You asked ${isQuestion(query) ? '' : 'about'} "${query}"`,
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

    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [messages]);

    return (
        <div
            className={tcls(
                'mx-auto h-full justify-between overflow-y-auto p-8',
                searchState?.mode === 'chat' && 'md:px-20'
            )}
        >
            {searchState?.mode === 'chat' ? (
                <div className="left-4 mb-8 md:absolute">
                    <Button
                        label="Show search results"
                        variant="blank"
                        size="small"
                        icon="arrow-up-to-line"
                        className="md:hidden"
                        onClick={() => {
                            setSearchState((state) =>
                                state ? { ...state, mode: 'both', manual: true } : null
                            );
                        }}
                    />
                    <Button
                        label="Show search results"
                        iconOnly
                        variant="blank"
                        icon="arrow-left-to-line"
                        className="hidden md:block"
                        onClick={() => {
                            setSearchState((state) =>
                                state ? { ...state, mode: 'both', manual: true } : null
                            );
                        }}
                    />
                </div>
            ) : null}
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

                {messages.map((message, index) => (
                    <div
                        key={message.content}
                        ref={index === messages.length - 1 ? latestMessageRef : null}
                        className={tcls(
                            'flex scroll-mt-20 scroll-mb-[100%] flex-col gap-1',
                            message.role === 'user' && 'items-end gap-1 self-end',
                            index === messages.length - 1 && 'mb-[45vh]'
                        )}
                    >
                        {message.role === 'user' ? (
                            <h5 className="flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                                {message.context ?? `You asked ${isQuestion(query) ? '' : 'about'}`}
                            </h5>
                        ) : (
                            <h5 className="flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                                <Icon icon="sparkle" className="mt-0.5 size-3" />{' '}
                                {message.context ?? 'AI Answer'}
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
                                onClick={() => {
                                    setMessages((prev) => [
                                        ...prev,
                                        { role: 'user', content: 'Hello', fetching: false },
                                    ]);
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
