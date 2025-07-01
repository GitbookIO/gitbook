import { tcls } from '@/lib/tailwind';
import { AIMessageRole } from '@gitbook/api';
import type React from 'react';
import type { AIChatState } from '../AI/useAIChat';

export function AIChatMessages(props: {
    chat: AIChatState;
    lastUserMessageRef?: React.RefObject<HTMLDivElement>;
}) {
    const { chat, lastUserMessageRef } = props;

    return (
        <>
            {chat.messages.map((message, index) => {
                const isLastUserMessage =
                    message.role === AIMessageRole.User &&
                    index === chat.messages.map((m) => m.role).lastIndexOf(AIMessageRole.User);

                return (
                    <div
                        ref={isLastUserMessage ? lastUserMessageRef : undefined}
                        className={tcls(
                            message.content ? 'animate-[fadeIn_500ms_both]' : '',
                            'shrink-0',
                            'last:min-h-[calc(100%-5rem)]',
                            message.role === AIMessageRole.User
                                ? 'max-w-[80%] self-end rounded-md bg-tint px-4 py-2'
                                : ''
                        )}
                        style={{
                            animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                        }}
                        key={index}
                    >
                        {message.content ? (
                            message.content
                        ) : chat.loading ? (
                            <div className="flex w-full animate-[fadeIn_500ms_both] flex-wrap gap-2">
                                {Array.from({ length: 7 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-4 animate-[fadeIn_0.5s_ease_both,pulse_1.5s_infinite] rounded-md bg-tint-4"
                                        style={{
                                            width: `calc(${(index % 4) * 20 + 10}% - 4px)`,
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </>
    );
}
