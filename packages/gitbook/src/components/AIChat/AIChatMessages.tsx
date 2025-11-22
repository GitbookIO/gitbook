import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { AIMessageRole } from '@gitbook/api';
import type { AIChatController, AIChatState } from '../AI';
import { AIChatToolConfirmations } from './AIChatToolConfirmations';
import { AIResponseFeedback } from './AIResponseFeedback';
import { AIChatFollowupSuggestions } from './AiChatFollowupSuggestions';

export function AIChatMessages(props: {
    chat: AIChatState;
    chatController: AIChatController;
}) {
    const { chat, chatController } = props;

    // Group messages: user messages start a new group, all following messages until next user message belong to that group
    const messageGroups: Array<
        Array<{ message: (typeof chat.messages)[0]; originalIndex: number }>
    > = [];
    let currentGroup: Array<{ message: (typeof chat.messages)[0]; originalIndex: number }> = [];

    chat.messages.forEach((message, index) => {
        if (message.role === AIMessageRole.User) {
            // Start a new group
            if (currentGroup.length > 0) {
                messageGroups.push(currentGroup);
            }
            currentGroup = [{ message, originalIndex: index }];
        } else {
            // Add to current group
            currentGroup.push({ message, originalIndex: index });
        }
    });

    // Add the last group if it exists
    if (currentGroup.length > 0) {
        messageGroups.push(currentGroup);
    }

    return messageGroups.map((group, groupIndex) => {
        const isLastGroup = group === messageGroups[messageGroups.length - 1];
        return (
            <div
                key={groupIndex}
                id={`message-group-${groupIndex}`}
                className={tcls(
                    'flex flex-col gap-2 pt-2',
                    isLastGroup ? 'shrink-0 basis-full' : '',

                    'transition-discrete'
                )}
                style={{ animationDelay: '.2s' }}
            >
                {group.map(({ message, originalIndex }) => {
                    const isLastMessage = originalIndex === chat.messages.length - 1;
                    return (
                        <div
                            key={originalIndex}
                            id={`message-${originalIndex}`}
                            className={tcls(
                                'flex flex-col gap-6',
                                'break-words',
                                'group/message',
                                'animate-blur-in-slow',
                                isLastMessage ? 'basis-full' : '',
                                message.role === AIMessageRole.User
                                    ? 'max-w-[80%] origin-top-right self-end circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint px-4 py-2'
                                    : 'origin-top-left text-tint-strong'
                            )}
                            style={{
                                animationDelay: `${Math.min(originalIndex * 0.1, 0.6)}s`,
                            }}
                        >
                            {message.content}

                            {isLastMessage && message.role === AIMessageRole.Assistant ? (
                                <div
                                    className={tcls(
                                        'flex w-full shrink-0 flex-col gap-2 starting:opacity-0 transition-all transition-discrete duration-500',
                                        chat.loading ? '' : 'hidden opacity-0'
                                    )}
                                >
                                    <HoldMessage className={message.content ? 'hidden' : ''} />
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
            </div>
        );
    });
}

export function HoldMessage({
    breakLines = false,
    className,
}: { breakLines?: boolean; className?: string }) {
    const language = useLanguage();

    return (
        <div
            className={tcls(
                'animate-[heightIn_.5s_5s_ease_both] overflow-hidden py-2 text-tint-subtle [&.hidden]:animate-[heightOut_1s_ease-in_both]',
                className
            )}
        >
            {tString(language, 'ai_chat_hold_message_1')
                .split(' ')
                .map((word, index) => (
                    <span
                        key={index}
                        className="animate-blur-in-slow"
                        style={{
                            animationDelay: `${5000 + index * 200}ms`,
                        }}
                    >
                        {word}{' '}
                    </span>
                ))}
            {breakLines ? <br /> : null}
            {tString(language, 'ai_chat_hold_message_2')
                .split(' ')
                .map((word, index) => (
                    <span
                        key={index}
                        className="animate-blur-in-slow"
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
                    className="h-4 animate-[blurIn_500ms_ease-out_both,pulse_1.5s_infinite] circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-solid/2"
                    style={{
                        width: `calc(${(4 - (index % 4)) * 8 + 14}% - 4px)`,
                        animationDelay: `${index * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );
}
