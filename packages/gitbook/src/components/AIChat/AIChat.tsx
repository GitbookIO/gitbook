'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { DropdownMenu, DropdownMenuItem } from '../Header/DropdownMenu';
import { Button } from '../primitives';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';
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

    return chat.opened ? (
        <div
            className={tcls(
                'ai-chat inset-y-0 right-0 z-40 mx-auto flex max-w-3xl animate-enterFromRight px-4 py-4 transition-all duration-300 sm:px-6 lg:fixed lg:w-72 lg:pr-4 lg:pl-0 xl:w-96',
                className
            )}
        >
            <div className="flex h-full grow flex-col overflow-hidden rounded-md bg-tint-base text-sm text-tint depth-subtle:shadow-lg shadow-tint ring-1 ring-tint-subtle">
                <div className="flex items-center gap-2 border-tint-subtle border-b bg-tint-subtle px-4 py-2 text-tint-strong">
                    <Icon icon="robot" className="size-4" />
                    <span className="font-bold">Docs Assistant</span>
                    <div className="ml-auto flex gap-2">
                        <DropdownMenu
                            button={
                                <Button
                                    onClick={() => {}}
                                    iconOnly
                                    icon="ellipsis"
                                    label="More actions"
                                    className="!px-2"
                                    variant="blank"
                                    size="default"
                                />
                            }
                        >
                            <DropdownMenuItem onClick={() => {}} disabled>
                                <Icon
                                    icon="arrow-up-from-bracket"
                                    className="size-3 text-tint-subtle"
                                />
                                Share conversation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    chatController.clear();
                                }}
                            >
                                <Icon icon="broom-wide" className="size-3 text-tint-subtle" />
                                Clear conversation
                            </DropdownMenuItem>
                        </DropdownMenu>
                        <Button
                            onClick={() => chatController.close()}
                            iconOnly
                            icon="close"
                            label="Close"
                            className="!px-2"
                            variant="blank"
                            size="default"
                        />
                    </div>
                </div>
                <div className="grow overflow-y-auto p-4">
                    {chat.messages.length === 0 ? (
                        <div className="flex h-full w-full flex-col items-center justify-center">
                            <div className="flex size-32 animate-[fadeIn_500ms_both] items-center justify-center self-center justify-self-center rounded-full bg-tint-subtle">
                                <Icon
                                    icon="robot"
                                    className="size-16 animate-[present_500ms_200ms_both]"
                                />
                            </div>
                            <h5 className="mt-4 animate-[fadeIn_500ms_400ms_both] text-center font-bold text-lg text-tint-strong">
                                Good evening Samy
                            </h5>
                            <p className="animate-[fadeIn_500ms_500ms_both] text-center text-tint">
                                I'm here to help you with the GitBook docs.
                            </p>
                        </div>
                    ) : (
                        <AIChatMessages chat={chat} />
                    )}
                </div>
                <div className="flex flex-col gap-2 p-4">
                    <AIChatFollowupSuggestions chat={chat} chatController={chatController} />
                    <AIChatInput
                        value={input}
                        onChange={setInput}
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
