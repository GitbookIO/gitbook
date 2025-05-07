'use client';
import { useEffect, useRef, useState } from 'react';
import { useVisitedPages } from '../Insights';
import { usePageContext } from '../PageContext';
import { Button } from '../primitives/Button';
import { useAdaptiveContext } from './AdaptiveContext';
import { streamPageQuestion } from './server-actions/streamPageQuestion';
import { streamPageSummary } from './server-actions/streamPageSummary';

interface ChatMessage {
    type: 'question' | 'answer';
    content: string;
}

type StreamData = { answer: string } | { newResponseId: string } | { toolUsage: boolean };

export function AIPageSummary() {
    const { toggle, setLoading, setToggle } = useAdaptiveContext();

    const currentPage = usePageContext();
    const visitedPages = useVisitedPages((state) => state.pages);
    const visitedPagesRef = useRef(visitedPages);

    const [summary, setSummary] = useState<{
        keyFacts?: string;
        bigPicture?: string;
    }>({});

    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAsking, setIsAsking] = useState(false);
    const [responseId, setResponseId] = useState<string | null>(null);
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);

    const handleSubmit = async () => {
        if (!question.trim() || isAsking) return;

        const currentQuestion = question;
        setQuestion('');
        setIsAsking(true);
        setShowTypingIndicator(true);

        // Add question to chat history
        setChatHistory((prev) => [...prev, { type: 'question', content: currentQuestion }]);

        try {
            const stream = await streamPageQuestion(currentQuestion, responseId ?? '');
            let currentAnswer = '';

            for await (const data of stream as AsyncIterableIterator<StreamData>) {
                if ('answer' in data && data.answer) {
                    currentAnswer = data.answer;
                    setShowTypingIndicator(false);
                    // Update the last message in chat history with the streaming answer
                    setChatHistory((prev) => {
                        const newHistory = [...prev];
                        const lastMessage = newHistory[newHistory.length - 1];
                        if (lastMessage?.type === 'answer') {
                            lastMessage.content = currentAnswer;
                        } else {
                            newHistory.push({ type: 'answer', content: currentAnswer });
                        }
                        return newHistory;
                    });
                } else if ('newResponseId' in data && data.newResponseId) {
                    setResponseId(data.newResponseId);
                } else if ('toolUsage' in data) {
                    // Show typing indicator when tools are being used
                    setShowTypingIndicator(true);
                }
            }
        } finally {
            setIsAsking(false);
            setShowTypingIndicator(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    useEffect(() => {
        if (!summary.keyFacts) setLoading(true);
    }, [summary.keyFacts, setLoading]);

    useEffect(() => {
        if (!visitedPages?.length) return;

        // Skip if the visited pages haven't changed
        if (JSON.stringify(visitedPagesRef.current) === JSON.stringify(visitedPages)) return;

        visitedPagesRef.current = visitedPages;

        let canceled = false;
        setLoading(true);

        (async () => {
            const stream = await streamPageSummary({
                currentPage: {
                    id: currentPage.pageId,
                    title: currentPage.title,
                },
                currentSpace: {
                    id: currentPage.spaceId,
                },
                visitedPages: visitedPages,
            });

            for await (const data of stream) {
                if (canceled) return;

                if ('responseId' in data && data.responseId !== undefined) {
                    setResponseId(data.responseId);
                }

                setSummary((prev) => ({
                    keyFacts: data.keyFacts ?? prev.keyFacts,
                    bigPicture: data.bigPicture ?? prev.bigPicture,
                }));
            }
        })().finally(() => {
            setLoading(false);
        });

        return () => {
            canceled = true;
        };
    }, [currentPage, visitedPages, setLoading]);

    const shimmerBlocks = [20, 35, 25, 10, 45, 30, 30, 35, 25, 10, 40, 30]; // Widths in percentages

    return (
        toggle.open && (
            <div className="flex min-w-64 animate-fadeIn flex-col gap-4">
                {summary.keyFacts ? (
                    <div>
                        <h5 className="mb-0.5 font-semibold text-tint-subtle text-xs uppercase">
                            Key facts
                        </h5>
                        {summary.keyFacts}
                    </div>
                ) : (
                    <div className="flex w-full flex-wrap gap-2">
                        {shimmerBlocks.map((width, index) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: No other distinguishing feature available
                                key={index}
                                className="h-4 animate-pulse rounded bg-tint-active"
                                style={{
                                    width: `${width}%`,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {visitedPages.length > 1 && summary?.bigPicture ? (
                    <div>
                        <h5 className="mb-0.5 font-semibold text-tint-subtle text-xs uppercase">
                            Big Picture
                        </h5>
                        {summary?.bigPicture}
                    </div>
                ) : null}

                {chatHistory.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {chatHistory.map((message) => (
                            <div
                                key={message.content.slice(0, 10)}
                                className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.type === 'question'
                                            ? 'bg-primary-solid text-contrast-primary-solid'
                                            : 'bg-tint-active'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {showTypingIndicator && (
                            <div className="flex justify-start">
                                <div className="flex max-w-[80%] items-center gap-2 rounded-lg bg-tint-active px-4 py-2">
                                    <span className="animate-pulse">•</span>
                                    <span
                                        className="animate-pulse"
                                        style={{ animationDelay: '0.3s' }}
                                    >
                                        •
                                    </span>
                                    <span
                                        className="animate-pulse"
                                        style={{ animationDelay: '0.6s' }}
                                    >
                                        •
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        className={`w-full rounded-md border border-tint-subtle px-3 py-2 transition-all duration-300 ${!responseId && 'scale-95'}`}
                        placeholder="Ask about this page"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isAsking || !responseId}
                    />
                    <Button
                        iconOnly
                        icon="send"
                        variant="blank"
                        disabled={!responseId}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        )
    );
}
