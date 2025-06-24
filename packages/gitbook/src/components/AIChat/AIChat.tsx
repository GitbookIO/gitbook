'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';

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
                <div className="flex items-center gap-2 border-tint-subtle border-b bg-tint-subtle p-4 font-bold text-tint-strong">
                    <Icon icon="gitbook" className="size-4" />
                    Chat
                    <Button
                        onClick={() => chatController.close()}
                        iconOnly
                        icon="close"
                        label="Close"
                        className="ml-auto px-2"
                        variant="blank"
                        size="default"
                    />
                </div>
                <div className="grow overflow-y-auto p-4">
                    <AIChatMessages chat={chat} />
                </div>
                <div className="flex border-tint-subtle border-t bg-tint-subtle p-4">
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
