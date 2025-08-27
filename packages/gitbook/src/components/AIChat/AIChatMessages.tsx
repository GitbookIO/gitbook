import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { AIMessageRole } from '@gitbook/api';
import type React from 'react';
import type { AIChatController, AIChatState } from '../AI';
import { AIChatToolConfirmations } from './AIChatToolConfirmations';
import { AIResponseFeedback } from './AIResponseFeedback';
import { AIChatFollowupSuggestions } from './AiChatFollowupSuggestions';

export function AIChatMessages(props: {
    chat: AIChatState;
    chatController: AIChatController;
    lastUserMessageRef?: React.RefObject<HTMLDivElement>;
}) {
    const { chat, chatController, lastUserMessageRef } = props;

    return (
        <>
            {chat.messages.map((message, index) => {
                const isLastMessage = index === chat.messages.length - 1;
                const isLastUserMessage =
                    message.role === AIMessageRole.User &&
                    index === chat.messages.map((m) => m.role).lastIndexOf(AIMessageRole.User);

                return (
                    <div
                        ref={isLastUserMessage ? lastUserMessageRef : undefined}
                        data-testid="ai-chat-message"
                        className={tcls(
                            message.content ? 'animate-fade-in-slow' : '',
                            'shrink-0',
                            'last:min-h-[calc(100%-5rem)]',
                            'scroll-mt-36',
                            'lg:scroll-mt-0',
                            'flex flex-col gap-6',
                            'break-words',
                            'group/message',
                            message.role === AIMessageRole.User
                                ? 'max-w-[80%] self-end circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint px-4 py-2'
                                : 'text-tint-strong'
                        )}
                        style={{
                            animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                        }}
                        key={index}
                    >
                        {message.content ? message.content : null}

                        {isLastMessage && chat.loading ? (
                            <div className="flex w-full animate-fade-in-slow flex-col gap-2">
                                {!message.content ? <HoldMessage /> : null}
                                <LoadingSkeleton />
                            </div>
                        ) : null}

                        {isLastMessage ? (
                            <>
                                {!chat.loading &&
                                !chat.error &&
                                chat.query &&
                                chat.responseId &&
                                chat.pendingTools.length === 0 ? (
                                    <AIResponseFeedback
                                        responseId={chat.responseId}
                                        query={chat.query}
                                        className="-ml-1 -mt-4"
                                    />
                                ) : null}
                                <AIChatToolConfirmations chat={chat} />
                                <AIChatFollowupSuggestions
                                    chat={chat}
                                    chatController={chatController}
                                />
                            </>
                        ) : null}
                    </div>
                );
            })}
        </>
    );
}

function HoldMessage() {
    const language = useLanguage();

    return (
        <div className="animate-[heightIn_500ms_4500ms_ease_both] py-2 text-tint-subtle">
            {tString(language, 'ai_chat_hold_message_1')
                .split(' ')
                .map((word, index) => (
                    <span
                        key={index}
                        className="animate-fade-in-slow"
                        style={{
                            animationDelay: `${5000 + index * 200}ms`,
                        }}
                    >
                        {word}{' '}
                    </span>
                ))}
            {tString(language, 'ai_chat_hold_message_2')
                .split(' ')
                .map((word, index) => (
                    <span
                        key={index}
                        className="animate-fade-in-slow"
                        style={{
                            animationDelay: `${10000 + index * 200}ms`,
                        }}
                    >
                        {word}{' '}
                    </span>
                ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
                <div
                    key={index}
                    className="h-4 animate-[fadeIn_500ms_ease_both,pulse_1.5s_infinite] circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-4"
                    style={{
                        width: `calc(${(index % 4) * 20 + 10}% - 4px)`,
                        animationDelay: `${index * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );
}
