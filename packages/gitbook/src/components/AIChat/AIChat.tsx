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
    EmbeddableFrameSubtitle,
    EmbeddableFrameTitle,
} from '../Embeddable/EmbeddableFrame';
import { useTrackEvent } from '../Insights';
import { Button } from '../primitives';
import { ScrollContainer } from '../primitives/ScrollContainer';
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
        <div
            data-testid="ai-chat"
            className={tcls(
                'ai-chat inset-y-0 right-0 z-40 mx-auto flex max-w-3xl scroll-mt-36 px-4 py-4 transition-[width,opacity,margin,display] transition-discrete duration-300 sm:px-6 lg:fixed lg:w-80 lg:p-0 xl:w-96',
                chat.opened
                    ? 'lg:starting:ml-0 lg:starting:w-0 lg:starting:opacity-0'
                    : 'hidden lg:ml-0 lg:w-0! lg:opacity-0'
            )}
        >
            <EmbeddableFrame className="relative max-w-full shrink-0 border-tint-subtle border-l to-tint-base transition-all duration-300 max-lg:circular-corners:rounded-3xl max-lg:rounded-corners:rounded-md max-lg:border lg:w-76 xl:w-92">
                <EmbeddableFrameHeader>
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
                            size="default"
                        />
                    </EmbeddableFrameButtons>
                </EmbeddableFrameHeader>
                <EmbeddableFrameBody>
                    <AIChatBody chatController={chatController} chat={chat} />
                </EmbeddableFrameBody>
            </EmbeddableFrame>
        </div>
    );
}

/**
 * Dynamic icon to indicate the AI chat state.
 */
export function AIChatDynamicIcon(props: {
    trademark: boolean;
}) {
    const { trademark } = props;
    const chat = useAIChatState();

    return (
        <AIChatIcon
            className="size-5 text-tint"
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
        <EmbeddableFrameSubtitle className={chat.loading ? 'h-3 opacity-11' : 'h-0 opacity-0'}>
            {chat.messages[chat.messages.length - 1]?.content
                ? tString(language, 'ai_chat_working')
                : tString(language, 'ai_chat_thinking')}
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
}) {
    const { chatController, chat, suggestions } = props;
    const { trademark } = useAI().config;

    const [input, setInput] = React.useState('');

    const isEmpty = !chat.messages.length;

    return (
        <>
            <ScrollContainer
                className="grow animate-fade-in-slow"
                contentClassName="p-4 gutter-stable flex flex-col gap-4"
                orientation="vertical"
                fadeEdges={['leading']}
                active={`message-group-${chat.messages.filter((message) => message.role === 'user').length - 1}`}
            >
                {isEmpty ? (
                    <div className="flex grow flex-col items-center gap-6">
                        <div className="my-auto flex size-32 shrink-0 animate-[scaleIn_500ms_300ms_both] items-center justify-center rounded-full bg-primary-solid/1">
                            <AIChatIcon
                                state="intro"
                                trademark={trademark}
                                className="size-16 animate-[scaleIn_500ms_500ms_both] text-primary"
                            />
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

            <div className="flex flex-col gap-2 px-4 pb-4">
                {/* Display an error banner when something went wrong. */}
                {chat.error ? <AIChatError chatController={chatController} /> : null}

                <AIChatInput
                    value={input}
                    onChange={setInput}
                    loading={chat.loading}
                    disabled={chat.loading || chat.error}
                    onSubmit={() => {
                        chatController.postMessage({ message: input });
                        setInput('');
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
