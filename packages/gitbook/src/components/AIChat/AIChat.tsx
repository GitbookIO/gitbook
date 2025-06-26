'use client';

import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { DropdownMenu, DropdownMenuItem } from '../Header/DropdownMenu';
import { Button } from '../primitives';
import AIChatIcon from './AIChatIcon';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';
import AIChatSuggestedQuestions from './AIChatSuggestedQuestions';
import { AIChatFollowupSuggestions } from './AiChatFollowupSuggestions';

interface AIChatProps {
    /** Optional className for styling */
    className?: string;
    /** Children components */
    children?: React.ReactNode;
}

export function AIChat(props: AIChatProps) {
    const { className } = props;

    const [input, setInput] = React.useState('');
    const chatController = useAIChatController();
    const chat = useAIChatState();

    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    // Ref for the last user message element
    const lastUserMessageRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLDivElement>(null);

    const [inputHeight, setInputHeight] = React.useState(0);
    const language = useLanguage();

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return tString(language, 'ai_chat_assistant_greeting_morning');
        if (hour < 18) return tString(language, 'ai_chat_assistant_greeting_afternoon');
        return tString(language, 'ai_chat_assistant_greeting_evening');
    };

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
        containerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                setInputHeight(entry.contentRect.height + 32);
            });
        });
        if (inputRef.current) {
            observer.observe(inputRef.current);
        }
        return () => observer.disconnect();
    }, [chat.opened]);

    return chat.opened ? (
        <div
            className={tcls(
                'ai-chat inset-y-0 right-0 z-40 mx-auto flex max-w-3xl animate-present px-4 py-4 transition-all duration-300 sm:px-6 lg:fixed lg:w-72 lg:animate-enterFromRight lg:pr-4 lg:pl-0 xl:w-96',
                className
            )}
            ref={containerRef}
        >
            <div className="relative flex h-full grow flex-col overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-md bg-tint-base text-sm text-tint depth-subtle:shadow-lg shadow-tint ring-1 ring-tint-subtle">
                <div className="flex items-center gap-2 border-tint-subtle border-b bg-tint-subtle px-4 py-2 text-tint-strong">
                    <AIChatIcon className="size-5 text-tint" />
                    <span className="font-bold">Docs Assistant</span>
                    <div className="ml-auto flex gap-2">
                        <DropdownMenu
                            button={
                                <Button
                                    onClick={() => {}}
                                    iconOnly
                                    icon="ellipsis"
                                    label={tString(language, 'more')}
                                    className="!px-2"
                                    variant="blank"
                                    size="default"
                                />
                            }
                        >
                            <DropdownMenuItem
                                onClick={() => {
                                    chatController.clear();
                                }}
                                disabled={chat.messages.length === 0}
                            >
                                <Icon icon="broom-wide" className="size-3 text-tint-subtle" />
                                {t(language, 'ai_chat_clear_conversation')}
                            </DropdownMenuItem>
                        </DropdownMenu>
                        <Button
                            onClick={() => chatController.close()}
                            iconOnly
                            icon="close"
                            label={tString(language, 'close')}
                            className="!px-2"
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
                    {chat.messages.length === 0 ? (
                        <div className="flex min-h-full w-full shrink-0 flex-col items-center justify-center gap-6 py-4">
                            <div className="flex size-32 animate-[fadeIn_500ms_both] items-center justify-center self-center justify-self-center rounded-full bg-tint-subtle">
                                <AIChatIcon className="size-16 animate-[present_500ms_200ms_both]" />
                            </div>
                            <div className="animate-[fadeIn_500ms_400ms_both]">
                                <h5 className=" text-center font-bold text-lg text-tint-strong">
                                    {getTimeGreeting()}
                                </h5>
                                <p className="text-center text-tint">
                                    {t(language, 'ai_chat_assistant_description')}
                                </p>
                            </div>
                            <AIChatSuggestedQuestions chatController={chatController} />
                        </div>
                    ) : (
                        <AIChatMessages chat={chat} lastUserMessageRef={lastUserMessageRef} />
                    )}
                </div>
                <div
                    ref={inputRef}
                    className="absolute inset-x-0 bottom-0 mr-2 flex flex-col gap-4 bg-gradient-to-b from-transparent to-50% to-tint-base/9 p-4 pr-2"
                >
                    <AIChatFollowupSuggestions chat={chat} chatController={chatController} />
                    <AIChatInput
                        value={input}
                        onChange={setInput}
                        disabled={chat.loading}
                        onSubmit={() => {
                            chatController.postMessage({ message: input });
                            setInput('');
                        }}
                    />
                </div>
            </div>
        </div>
    ) : null;
}
