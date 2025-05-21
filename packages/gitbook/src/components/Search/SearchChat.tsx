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

    const isExpanded = searchState?.mode === 'chat';

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
            setFollowupQuestions([]);

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
        <div className={tcls('flex h-full flex-col')}>
            {searchState?.mode === 'chat' ? (
                <div className="absolute top-2 max-md:right-4 md:top-4 md:left-4">
                    <Button
                        label="Show search results"
                        variant="secondary"
                        size="small"
                        iconOnly
                        icon="arrow-down-from-line"
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
                        size="default"
                        icon="sidebar"
                        className="hidden px-2 md:block"
                        onClick={() => {
                            setSearchState((state) =>
                                state ? { ...state, mode: 'both', manual: true } : null
                            );
                        }}
                    />
                </div>
            ) : null}
            <div
                className={tcls(
                    'mx-auto flex w-full grow scroll-pt-16 flex-col gap-4 overflow-y-auto p-8',
                    isExpanded && 'md:px-16'
                )}
            >
                <div className="mx-auto w-full max-w-prose">
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
                            'mx-auto flex w-full max-w-prose flex-col gap-1',
                            message.role === 'user' && 'items-end gap-1 self-end',
                            index === messages.length - 1 && 'min-h-full'
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

                        {index === messages.length - 1 &&
                            followupQuestions &&
                            followupQuestions.length > 0 && (
                                <div className="mx-auto my-4 flex w-full max-w-prose flex-col">
                                    {followupQuestions?.map((question) => (
                                        <div
                                            key={question}
                                            className="-mx-4 flex items-center gap-4 rounded straight-corners:rounded-none px-4 py-2 text-tint hover:bg-tint-hover"
                                        >
                                            <Icon icon="search" className="size-4" /> {question}
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                ))}
            </div>

            {query ? (
                <div
                    className={tcls(
                        'border-tint-subtle border-t bg-tint-subtle px-8 py-4',
                        isExpanded && 'md:px-16'
                    )}
                >
                    <div className="mx-auto flex w-full max-w-prose flex-col gap-2">
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
