'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';
import { Icon } from '@gitbook/icons';
import { useEffect, useRef, useState } from 'react';
import { useVisitedPages } from '../Insights/useVisitedPages';
import { Button } from '../primitives';
import { Shortcut } from './SearchButton';
import { isQuestion } from './isQuestion';
import { streamAISearchAnswer, streamAISearchSummary } from './server-actions';
import { useSearch } from './useSearch';

// Types
type Message = {
    role: 'assistant' | 'user';
    content?: string;
    context?: string;
    fetching?: boolean;
};

// Loading animation component
function LoadingAnimation() {
    return (
        <div className="mt-2 flex flex-wrap gap-2">
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
    );
}

// Followup questions component
function FollowupQuestions({
    questions,
    onQuestionClick,
}: {
    questions: string[];
    onQuestionClick: (question: string) => void;
}) {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="mx-auto flex w-full max-w-prose flex-col">
            {questions.map((question) => (
                <button
                    type="button"
                    key={question}
                    className="-mx-4 flex items-center gap-4 rounded straight-corners:rounded-none px-4 py-2 text-tint hover:bg-tint-hover"
                    onClick={() => onQuestionClick(question)}
                >
                    <Icon icon="search" className="size-4" /> {question}
                </button>
            ))}
        </div>
    );
}

// Individual chat message component
function ChatMessage({
    message,
}: {
    message: Message;
}) {
    const language = useLanguage();
    const isUser = message.role === 'user';

    return (
        <div className={tcls('flex-col gap-1', isUser && 'items-end gap-1 self-end')}>
            <h5 className="flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                {isUser ? (
                    (message.context ??
                    `You asked ${isQuestion(message.content ?? '') ? '' : 'about'}`)
                ) : (
                    <>
                        <Icon icon="sparkle" className="mt-0.5 size-3" />
                        {message.context ?? 'AI Answer'}
                    </>
                )}
            </h5>

            {message.fetching ? (
                <LoadingAnimation />
            ) : !message.content ? (
                <div className="text-tint-subtle italic">{t(language, 'search_ask_no_answer')}</div>
            ) : (
                <div className={tcls(isUser && 'rounded-lg bg-tint-active px-4 py-2')}>
                    {message.content}
                </div>
            )}
        </div>
    );
}

// Chat input component
function ChatInput({
    onSendMessage,
    disabled,
    inputRef,
}: {
    onSendMessage: (message: string) => void;
    disabled: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
}) {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    return (
        <div className="flex gap-2">
            <div className="relative flex grow">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask a follow-up question"
                    className="grow rounded px-4 py-1 ring-1 ring-tint-subtle"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={disabled}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                {!disabled && (
                    <div className="-translate-y-1/2 absolute top-1/2 right-2.5">
                        <Shortcut />
                    </div>
                )}
            </div>
            <Button
                label="Send"
                iconOnly
                icon="arrow-up"
                size="medium"
                className="shrink-0"
                onClick={handleSend}
            />
        </div>
    );
}

// Custom hook for AI streaming
function useAIStream({
    question,
    previousResponseId,
}: {
    question?: string;
    previousResponseId?: string;
}) {
    const [response, setResponse] = useState<{
        content?: string;
        responseId?: string;
        followupQuestions?: string[];
        fetching: boolean;
    }>({
        fetching: false,
    });

    useEffect(() => {
        if (!question) return;

        let cancelled = false;
        setResponse({ fetching: true });

        (async () => {
            try {
                const stream = await streamAISearchAnswer({
                    question,
                    previousResponseId,
                });

                for await (const rawData of stream) {
                    if (cancelled) break;
                    if (!rawData) continue;

                    // Use type assertion to handle the data
                    const data = rawData as any;

                    setResponse((prev) => {
                        const updated = { ...prev, fetching: false };

                        if (data.responseId) {
                            updated.responseId = String(data.responseId);
                        }

                        if (data.answer) {
                            updated.content = String(data.answer);
                        }

                        if (data.followupQuestions) {
                            updated.followupQuestions =
                                data.followupQuestions.filter(filterOutNullable);
                        }

                        return updated;
                    });
                }
            } catch (error) {
                console.error('Error in AI stream:', error);
                setResponse((prev) => ({ ...prev, fetching: false }));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [question, previousResponseId]);

    return response;
}

// Summary hook
function useSummary(visitedPages: any[]) {
    const [summary, setSummary] = useState<React.ReactNode | undefined>(undefined);
    const [summaryResponseId, setSummaryResponseId] = useState<string | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const stream = await streamAISearchSummary({ visitedPages });

                for await (const data of stream) {
                    if (cancelled) break;
                    if (!data) continue;

                    if (data.responseId) {
                        setSummaryResponseId(String(data.responseId));
                    }

                    if (data.output) {
                        setSummary(data.output);
                    }
                }
            } catch (error) {
                console.error('Error in summary stream:', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [visitedPages]);

    return { summary, summaryResponseId };
}

// Main component
export function SearchChat(props: {
    query: string;
    chatInputRef?: React.RefObject<HTMLInputElement>;
}) {
    const { query, chatInputRef } = props;
    const visitedPages = useVisitedPages((state) => state.pages);
    const [messages, setMessages] = useState<Message[]>([]);
    const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
    const [conversationResponseId, setConversationResponseId] = useState<string | undefined>();
    const [searchState, setSearchState] = useSearch();
    const latestMessageRef = useRef<HTMLDivElement>(null);

    const isExpanded = searchState?.mode === 'chat';

    // Get summary of visited pages
    const { summary, summaryResponseId } = useSummary(visitedPages);

    // Handle initial query
    const initialResponse = useAIStream({
        question: query,
        previousResponseId: summaryResponseId,
    });

    // Set up initial query effect
    useEffect(() => {
        if (!query) return;

        // Add initial assistant message
        setMessages([
            {
                role: 'assistant',
                context: `You asked ${isQuestion(query) ? '' : 'about'} "${query}"`,
                fetching: true,
            },
        ]);

        setFollowupQuestions([]);
        setConversationResponseId(undefined);
    }, [query]);

    // Update message when initial response changes
    useEffect(() => {
        if (!query || !initialResponse) return;

        if (initialResponse.content !== undefined) {
            setMessages([
                {
                    role: 'assistant',
                    context: `You asked ${isQuestion(query) ? '' : 'about'} "${query}"`,
                    content: initialResponse.content,
                    fetching: initialResponse.fetching,
                },
            ]);
        }

        if (initialResponse.followupQuestions) {
            setFollowupQuestions(initialResponse.followupQuestions);
        }

        if (initialResponse.responseId) {
            setConversationResponseId(initialResponse.responseId);
        }
    }, [initialResponse, query]);

    // Handle follow-up messages
    const handleSendMessage = (message: string) => {
        // Add user message
        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: message, fetching: false },
            { role: 'assistant', fetching: true },
        ];

        setMessages(newMessages);
        setFollowupQuestions([]);
        if (!searchState?.manual) {
            setSearchState((state) => (state ? { ...state, mode: 'chat' } : null));
        }

        // Get AI response
        const cancelled = false;

        (async () => {
            try {
                const stream = await streamAISearchAnswer({
                    question: message,
                    previousResponseId: conversationResponseId,
                });

                for await (const rawData of stream) {
                    if (cancelled) break;
                    if (!rawData) continue;

                    // Use type assertion
                    const data = rawData as any;

                    if (data.responseId) {
                        setConversationResponseId(String(data.responseId));
                    }

                    if (data.answer !== undefined) {
                        setMessages((prev) => [
                            ...prev.slice(0, -1),
                            { role: 'assistant', content: data.answer, fetching: false },
                        ]);
                    }

                    if (data.followupQuestions && Array.isArray(data.followupQuestions)) {
                        setFollowupQuestions(data.followupQuestions.filter(filterOutNullable));
                    }
                }
            } catch (error) {
                console.error('Error in follow-up stream:', error);
                // Update the message to show an error state
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: 'assistant', fetching: false },
                ]);
            }
        })();
    };

    // Handle followup question click
    const handleFollowupClick = (question: string) => {
        handleSendMessage(question);
    };

    // Auto-scroll to latest message
    useEffect(() => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [messages]);

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Toggle button for showing search results */}
            {searchState?.mode === 'chat' && (
                <div
                    className="absolute top-2 animate-fadeIn max-md:right-4 md:top-4 md:left-4"
                    style={{ animationDelay: '500ms' }}
                >
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
            )}

            {/* Main chat area */}
            <div
                className={tcls(
                    'mx-auto flex w-full grow scroll-pt-8 flex-col gap-4 overflow-y-auto p-8 transition-all delay-200 duration-500',
                    isExpanded && 'md:px-16'
                )}
                ref={latestMessageRef}
            >
                {/* Summary section */}
                <div className="mx-auto w-full max-w-prose">
                    <h5 className="mb-1 flex items-center gap-1 font-semibold text-tint-subtle text-xs">
                        <Icon icon="glasses-round" className="mt-0.5 size-3" /> Summary of what
                        you've read
                    </h5>
                    {summary ? summary : <LoadingAnimation />}
                </div>

                {/* Messages */}
                {messages.map((message, index) => {
                    const isLast = index === messages.length - 1;
                    return (
                        <div
                            key={index}
                            ref={isLast ? latestMessageRef : undefined}
                            className={tcls(
                                'mx-auto flex flex w-full max-w-prose flex-col gap-4',
                                isLast && 'min-h-[calc(100%-2rem)]'
                            )}
                        >
                            <ChatMessage message={message} />
                            {isLast && followupQuestions && followupQuestions.length > 0 && (
                                <FollowupQuestions
                                    questions={followupQuestions}
                                    onQuestionClick={handleFollowupClick}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input area */}
            {query && (
                <div
                    className={tcls(
                        'border-tint-subtle border-t bg-tint-subtle px-8 py-4 transition-all delay-200 duration-500',
                        isExpanded && 'md:px-16'
                    )}
                >
                    <div className={tcls('mx-auto flex w-full max-w-prose flex-col gap-2')}>
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            disabled={!conversationResponseId}
                            inputRef={chatInputRef}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
