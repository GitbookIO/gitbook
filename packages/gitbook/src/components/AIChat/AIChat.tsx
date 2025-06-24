'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { AIChatInput } from './AIChatInput';
import { AIChatMessages } from './AIChatMessages';

interface AIChatProps {
    /** Optional className for styling */
    className?: string;
    /** Children components */
    children?: React.ReactNode;
}

export function AIChat(props: AIChatProps): React.ReactElement {
    const { className } = props;

    const [input, setInput] = React.useState('');
    const chatController = useAIChatController();
    const chat = useAIChatState();

    return (
        <div
            className={tcls(
                'fixed inset-y-4 right-4 z-40 w-96 rounded-md border border-tint-subtle bg-tint-subtle shadow-lg shadow-tint transition-all duration-300',
                'animate-exitToRight chat-open:animate-enterFromRight',
                className
            )}
        >
            <div className="flex items-center gap-2 p-4 font-bold text-sm text-tint-strong">
                <Icon icon="gitbook" className="size-4" />
                Chat
                <Icon
                    icon={chat.opened ? 'chevron-down' : 'chevron-up'}
                    className="ml-auto size-4 text-tint-subtle"
                />
            </div>
            <div>
                <AIChatMessages chat={chat} />
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
    );
}
