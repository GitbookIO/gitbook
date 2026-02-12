'use client';

import { t, tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    type AIChatController,
    type AIChatState,
    useAI,
    useAIChatController,
    useAIChatState,
} from '../AI';
import {
    EmbeddableFrame,
    EmbeddableFrameBody,
    EmbeddableFrameButtons,
    EmbeddableFrameHeader,
    EmbeddableFrameHeaderMain,
    EmbeddableFrameMain,
    EmbeddableFrameSubtitle,
    EmbeddableFrameTitle,
} from '../Embeddable/EmbeddableFrame';
import { useTrackEvent } from '../Insights';
import { useNow } from '../hooks';
import { Button } from '../primitives';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SideSheet } from '../primitives/SideSheet';
import { AIChatControlButton } from './AIChatControlButton';
import { AIChatIcon } from './AIChatIcon';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';
import AIChatSuggestedQuestions from './AIChatSuggestedQuestions';

export function AIChat() {
    const { config } = useAI();
    const language = useLanguage();
    const chat = useAIChatState();
    const chatController = useAIChatController();
    const containerRef = React.useRef<HTMLDivElement>(null);

    // When the chat is opened, scroll to it (applicable on mobile, where it's displayed above the content)
    React.useEffect(() => {
        if (chat.opened) {
            containerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [chat.opened]);

    useHotkeys(
        'esc',
        () => {
            chatController.close();
        },
        []
    );

    // Track the view of the AI chat
    const trackEvent = useTrackEvent();
    React.useEffect(() => {
        if (chat.opened) {
            trackEvent({
                type: 'ask_view',
            });
        }
    }, [chat.opened, trackEvent]);

    return (
        <SideSheet
            side="right"
            open={chat.opened}
            onOpenChange={(open) => {
                if (open) {
                    chatController.open();
                } else {
                    chatController.close();
                }
            }}
            withOverlay={true}
            className={tcls(
                'ai-chat mx-auto ml-8 not-hydrated:hidden w-96 transition-[width] duration-300 ease-quint lg:max-xl:w-80'
            )}
        >
            <EmbeddableFrame className="relative shrink-0 border-tint-subtle border-l to-tint-base">
                <EmbeddableFrameMain data-testid="ai-chat">
                    <EmbeddableFrameHeader className="not-embed:px-4">
                        <AIChatDynamicIcon trademark={config.trademark} />
                        <EmbeddableFrameHeaderMain>
                            <EmbeddableFrameTitle>
                                {getAIChatName(language, config.trademark)}
                            </EmbeddableFrameTitle>
                            <AIChatSubtitle chat={chat} />
                        </EmbeddableFrameHeaderMain>
                        <EmbeddableFrameButtons>
                            <AIChatControlButton />
                            <Button
                                onClick={() => chatController.close()}
                                iconOnly
                                icon="close"
                                label={tString(language, 'close')}
                                variant="blank"
                            />
                        </EmbeddableFrameButtons>
                    </EmbeddableFrameHeader>
                    <EmbeddableFrameBody className="not-embed:px-4">
                        <AIChatBody
                            chatController={chatController}
                            chat={chat}
                            suggestions={config.suggestions}
                        />
                    </EmbeddableFrameBody>
                </EmbeddableFrameMain>
            </EmbeddableFrame>
        </SideSheet>
    );
}

/**
 * Dynamic icon to indicate the AI chat state.
 */
export function AIChatDynamicIcon(props: {
    trademark: boolean;
    className?: string;
}) {
    const { trademark, className } = props;
    const chat = useAIChatState();

    return (
        <AIChatIcon
            className={tcls('size-5 text-tint', className)}
            trademark={trademark}
            state={
                chat.error
                    ? 'error'
                    : chat.loading
                      ? chat.messages[chat.messages.length - 1]?.content
                          ? 'working'
                          : 'thinking'
                      : chat.messages.length > 0
                        ? chat.pendingTools.length > 0
                            ? 'confirm'
                            : 'done'
                        : 'default'
            }
        />
    );
}

/**
 * Subtitle of the AI chat window.
 */
export function AIChatSubtitle(props: {
    chat: AIChatState;
}) {
    const { chat } = props;
    const language = useLanguage();

    return (
        <EmbeddableFrameSubtitle
            className={tcls('relative', chat.loading ? 'h-3 opacity-11' : 'h-0 opacity-0')}
        >
            <span
                className={tcls(
                    'absolute left-0',
                    chat.loading
                        ? chat.messages[chat.messages.length - 1]?.content
                            ? 'animate-blur-in-slow'
                            : 'hidden'
                        : 'animate-blur-out-slow'
                )}
            >
                {t(language, 'ai_chat_working')}
            </span>
            <span
                className={tcls(
                    'absolute left-0',
                    chat.loading
                        ? chat.messages[chat.messages.length - 1]?.content
                            ? 'animate-blur-out-slow'
                            : 'animate-blur-in-slow'
                        : 'hidden'
                )}
            >
                {t(language, 'ai_chat_thinking')}
            </span>
        </EmbeddableFrameSubtitle>
    );
}

/**
 * Body of the AI chat window.
 */
export function AIChatBody(props: {
    chatController: AIChatController;
    chat: AIChatState;
    welcomeMessage?: string;
    suggestions?: string[];
    greeting?: {
        title: string;
        subtitle: string;
    };
}) {
    const { chatController, chat, suggestions, greeting } = props;
    const { trademark } = useAI().config;

    const language = useLanguage();
    const now = useNow(60 * 60 * 1000); // Refresh every hour for greeting

    const isEmpty = !chat.messages.length;

    const timeGreeting = React.useMemo(() => {
        const hour = new Date(now).getHours();
        if (hour < 6) return tString(language, 'ai_chat_assistant_greeting_night');
        if (hour < 12) return tString(language, 'ai_chat_assistant_greeting_morning');
        if (hour < 18) return tString(language, 'ai_chat_assistant_greeting_afternoon');
        return tString(language, 'ai_chat_assistant_greeting_evening');
    }, [now, language]);

    return (
        <>
            <ScrollContainer
                className="shrink grow basis-80 animate-fade-in-slow [container-type:size]"
                contentClassName="py-4 gutter-stable flex flex-col gap-4"
                orientation="vertical"
                trailing={{ fade: false, button: true }}
                active={`#message-group-${chat.messages.filter((message) => message.role === 'user').length - 1}`}
            >
                {isEmpty ? (
                    <div className="flex grow flex-col">
                        <div className="my-auto flex flex-row items-center gap-4 pb-6 [@container(min-height:400px)]:flex-col">
                            <div
                                className="flex size-16 shrink-0 animate-scale-in items-center justify-center rounded-full bg-primary-solid/1 [@container(min-height:400px)]:size-32"
                                style={{ animationDelay: '.3s' }}
                            >
                                <AIChatIcon
                                    state="intro"
                                    trademark={trademark}
                                    className="size-8 text-primary [@container(min-height:400px)]:size-16"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-1 [@container(min-height:400px)]:items-center">
                                <h5
                                    className="animate-blur-in-slow font-bold text-lg text-tint-strong leading-tight [@container(min-height:400px)]:text-center"
                                    style={{ animationDelay: '.5s' }}
                                    data-testid="ai-chat-greeting-title"
                                >
                                    {greeting?.title || timeGreeting}
                                </h5>
                                <p
                                    className="animate-blur-in-slow text-tint leading-tight [@container(min-height:400px)]:text-center"
                                    style={{ animationDelay: '.6s' }}
                                    data-testid="ai-chat-greeting-subtitle"
                                >
                                    {greeting?.subtitle ||
                                        t(language, 'ai_chat_assistant_description')}
                                </p>
                            </div>
                        </div>
                        {!chat.error ? (
                            <AIChatSuggestedQuestions
                                chatController={chatController}
                                suggestions={suggestions}
                            />
                        ) : null}
                    </div>
                ) : (
                    <AIChatMessages chat={chat} chatController={chatController} />
                )}
            </ScrollContainer>

            <div className="flex flex-col gap-2 pb-4">
                {/* Display an error banner when something went wrong. */}
                {chat.error ? <AIChatError chatController={chatController} /> : null}

                <AIChatInput
                    loading={chat.loading}
                    disabled={chat.loading || chat.error}
                    onSubmit={(value) => {
                        chatController.postMessage({ message: value });
                    }}
                />
            </div>
        </>
    );
}

function AIChatError(props: { chatController: AIChatController }) {
    const language = useLanguage();
    const { chatController } = props;

    return (
        <div className="flex animate-scale-in flex-wrap justify-between gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md bg-danger px-3 py-2 text-danger text-sm ring-1 ring-danger">
            <div className="flex items-center gap-2">
                <Icon icon="exclamation-triangle" className="size-3.5" />
                <span className="flex items-center gap-1">{t(language, 'ai_chat_error')}</span>
            </div>
            <div className="flex justify-end">
                <Button
                    variant="blank"
                    size="small"
                    icon="refresh"
                    label={tString(language, 'unexpected_error_retry')}
                    onClick={() => {
                        chatController.clear();
                    }}
                    className="text-danger! hover:bg-danger-5"
                />
            </div>
        </div>
    );
}

export function getAIChatName(language: TranslationLanguage, trademark: boolean) {
    return trademark
        ? tString(language, 'ai_chat_assistant_name')
        : tString(language, 'ai_chat_assistant_name_unbranded');
}
