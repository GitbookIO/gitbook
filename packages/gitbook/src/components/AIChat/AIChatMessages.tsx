import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { AIMessageRole } from '@gitbook/api';
import {
    type AIChatController,
    type AIChatMessage,
    type AIChatState,
    getAIChatStatus,
} from '../AI';
import { ToggleChevron } from '../primitives';
import { Button } from '../primitives/Button';
import { Collapsible, CollapsibleTrigger } from '../primitives/Collapsible';
import { AIResponseFeedback } from './AIResponseFeedback';
import { AIChatFollowupSuggestions } from './AiChatFollowupSuggestions';

export function AIChatMessages(props: {
    chat: AIChatState;
    chatController: AIChatController;
}) {
    const { chat, chatController } = props;
    const status = getAIChatStatus(chat);
    const showLoadingShim = chat.loading && status !== 'working' && status !== 'done';

    // Group messages: user messages start a new group, all following messages until next user message belong to that group
    type MessageGroup = { message: AIChatMessage; originalIndex: number };
    const messageGroups: Array<Array<MessageGroup>> = [];
    let currentGroup: Array<MessageGroup> = [];

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

    const language = useLanguage();

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
                    const toolCount = message.activity?.toolCount ?? 0;
                    const hasCommentary =
                        (message.activity?.hasCommentary ?? false) || toolCount > 0;
                    const hasFinalAnswer =
                        (message.activity?.hasFinalAnswer ?? false) || !isLastMessage;

                    return (
                        <Collapsible
                            open={!hasFinalAnswer}
                            disabled={!hasFinalAnswer}
                            key={originalIndex}
                            data-testid={
                                message.role === AIMessageRole.User
                                    ? 'ai-chat-message-user'
                                    : 'ai-chat-message-assistant'
                            }
                            id={`message-${originalIndex}`}
                            className={tcls(
                                'flex flex-col gap-2',
                                'break-words',
                                'group/message',
                                'animate-blur-in-slow',
                                message.role === AIMessageRole.User
                                    ? 'mb-4 max-w-[80%] origin-top-right self-end circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint px-4 py-2'
                                    : 'origin-top-left text-tint-strong',
                                isLastMessage && message.role === AIMessageRole.Assistant
                                    ? 'grow'
                                    : ''
                            )}
                            style={{
                                animationDelay: `${Math.min(originalIndex * 0.1, 0.6)}s`,
                            }}
                        >
                            {message.role === AIMessageRole.Assistant &&
                            hasCommentary &&
                            hasFinalAnswer ? (
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="blank"
                                        size="small"
                                        label={tString(language, 'ai_chat_view_activity')}
                                        className="-mx-3 -my-1.5 group/dropdown animate-blur-in-display-slow self-start"
                                    >
                                        <div className="flex items-center gap-2">
                                            {toolCount > 0
                                                ? t(
                                                      language,
                                                      'ai_chat_explored_with',
                                                      tString(
                                                          language,
                                                          toolCount === 1
                                                              ? 'tool_count'
                                                              : 'tool_count_plural',
                                                          toolCount.toString()
                                                      )
                                                  )
                                                : t(language, 'ai_chat_explored')}
                                            <ToggleChevron orientation="right-to-down" />
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                            ) : null}

                            {message.content}

                            {isLastMessage && message.role === AIMessageRole.Assistant ? (
                                <div
                                    className={tcls(
                                        'mt-4 flex w-full shrink-0 flex-col gap-2 overflow-hidden starting:opacity-0 transition-all transition-discrete duration-300',
                                        showLoadingShim
                                            ? 'max-h-48 opacity-11'
                                            : 'pointer-events-none max-h-0 opacity-0'
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
                                    !chat.control ? (
                                        <AIResponseFeedback
                                            responseId={chat.responseId}
                                            query={chat.query}
                                            className="-ml-1.5 -mt-4 mb-2"
                                        />
                                    ) : null}
                                    <AIChatFollowupSuggestions
                                        chat={chat}
                                        chatController={chatController}
                                    />
                                </>
                            ) : null}
                        </Collapsible>
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
