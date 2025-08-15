'use client';

import { t, tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    type AIChatController,
    type AIChatState,
    useAIChatController,
    useAIChatState,
} from '../AI';
import { useNow } from '../hooks';
import { Button } from '../primitives';
import { DropdownMenu, DropdownMenuItem } from '../primitives/DropdownMenu';
import { AIChatIcon } from './AIChatIcon';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';
import AIChatSuggestedQuestions from './AIChatSuggestedQuestions';

export function AIChat(props: { trademark: boolean }) {
    const { trademark } = props;
    const chat = useAIChatState();
    const chatController = useAIChatController();

    useHotkeys(
        'mod+i',
        (e) => {
            e.preventDefault();
            chatController.open();
        },
        []
    );

    useHotkeys(
        'esc',
        () => {
            chatController.close();
        },
        []
    );

    if (!chat.opened) {
        return null;
    }

    return <AIChatWindow trademark={trademark} chatController={chatController} chat={chat} />;
}

export function AIChatWindow(props: {
    chatController: AIChatController;
    chat: AIChatState;
    trademark: boolean;
}) {
    const { chatController, chat, trademark } = props;

    const [input, setInput] = React.useState('');

    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    // Ref for the last user message element
    const lastUserMessageRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLDivElement>(null);

    const [inputHeight, setInputHeight] = React.useState(0);
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

    // Auto-scroll to the latest user message when messages change
    React.useEffect(() => {
        if (chat.messages.length > 0 && lastUserMessageRef.current) {
            lastUserMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [chat.messages.length]);

    React.useEffect(() => {
        // When the chat is opened, scroll to it (applicable on mobile, where it's displayed above the content)
        containerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        const timeout = setTimeout(() => {
            if (lastUserMessageRef.current) {
                lastUserMessageRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }, 100);

        // We want the chat messages to scroll underneath the input, but they should scroll past the input when scrolling all the way down.
        // The best way to do this is to observe the input height and adjust the padding bottom of the scroll container accordingly.
        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                setInputHeight(entry.contentRect.height + 32);
            });
        });
        if (inputRef.current) {
            observer.observe(inputRef.current);
        }
        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            data-testid="ai-chat"
            className="ai-chat inset-y-0 right-0 z-40 mx-auto flex max-w-3xl animate-present scroll-mt-36 px-4 py-4 transition-all duration-300 sm:px-6 lg:fixed lg:w-80 lg:animate-enter-from-right lg:pr-4 lg:pl-0 xl:w-96"
            ref={containerRef}
        >
            <div className="relative flex h-full grow flex-col overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-md bg-tint-base text-sm text-tint depth-subtle:shadow-lg shadow-tint ring-1 ring-tint-subtle">
                <div className="flex select-none items-center gap-2 border-tint-subtle border-b bg-tint-subtle px-4 py-2 text-tint-strong">
                    <AIChatIcon
                        className="size-5 text-tint"
                        trademark={trademark}
                        state={
                            chat.error
                                ? 'error'
                                : chat.loading
                                  ? chat.messages[chat.messages.length - 1].content
                                      ? 'working'
                                      : 'thinking'
                                  : chat.messages.length > 0
                                    ? 'done'
                                    : 'default'
                        }
                    />
                    <div className="flex flex-col">
                        <div className="font-bold">{getAIChatName(trademark)}</div>
                        <div
                            className={`text-tint text-xs leading-none transition-all duration-500 ${
                                chat.loading ? 'h-3 opacity-11' : 'h-0 opacity-0'
                            }`}
                        >
                            {chat.loading
                                ? chat.messages[chat.messages.length - 1].content
                                    ? t(language, 'ai_chat_working')
                                    : t(language, 'ai_chat_thinking')
                                : ''}
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <DropdownMenu
                            button={
                                <Button
                                    onClick={() => {}}
                                    iconOnly
                                    icon="ellipsis"
                                    label={tString(language, 'actions')}
                                    variant="blank"
                                    size="default"
                                />
                            }
                        >
                            <DropdownMenuItem
                                onClick={() => {
                                    chatController.clear();
                                }}
                                disabled={isEmpty}
                            >
                                <Icon
                                    icon="broom-wide"
                                    className="size-3 shrink-0 text-tint-subtle"
                                />
                                {t(language, 'ai_chat_clear_conversation')}
                            </DropdownMenuItem>
                        </DropdownMenu>
                        <Button
                            onClick={() => chatController.close()}
                            iconOnly
                            icon="close"
                            label={tString(language, 'close')}
                            variant="blank"
                            size="default"
                        />
                    </div>
                </div>
                <div
                    ref={scrollContainerRef}
                    className="flex grow scroll-pt-4 flex-col gap-4 overflow-y-auto p-4"
                    style={{
                        paddingBottom: `${inputHeight}px`,
                    }}
                >
                    {isEmpty ? (
                        <div className="flex min-h-full w-full shrink-0 flex-col items-center justify-center gap-6 py-4">
                            <div className="flex size-32 animate-fade-in-slow items-center justify-center rounded-full bg-tint-subtle">
                                <AIChatIcon
                                    state="intro"
                                    trademark={trademark}
                                    className="size-16 animate-[present_500ms_200ms_both]"
                                />
                            </div>
                            <div className="animate-[fadeIn_500ms_400ms_both]">
                                <h5 className=" text-center font-bold text-lg text-tint-strong">
                                    {timeGreeting}
                                </h5>
                                <p className="text-center text-tint">
                                    {t(language, 'ai_chat_assistant_description')}
                                </p>
                            </div>
                            {!chat.error ? (
                                <AIChatSuggestedQuestions chatController={chatController} />
                            ) : null}
                        </div>
                    ) : (
                        <AIChatMessages
                            chat={chat}
                            chatController={chatController}
                            lastUserMessageRef={lastUserMessageRef}
                        />
                    )}
                </div>
                <div
                    ref={inputRef}
                    className="absolute inset-x-0 bottom-0 mr-2 flex select-none flex-col gap-4 bg-linear-to-b from-transparent to-50% to-tint-base/9 p-4 pr-2"
                >
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
            </div>
        </div>
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

export function getAIChatName(trademark: boolean) {
    const language = useLanguage();

    return trademark
        ? tString(language, 'ai_chat_assistant_name')
        : tString(language, 'ai_chat_assistant_name_unbranded');
}
