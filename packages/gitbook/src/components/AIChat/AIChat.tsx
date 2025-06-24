'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import type React from 'react';
import { useState } from 'react';

interface AIChatProps {
    /** Optional className for styling */
    className?: string;
    /** Children components */
    children?: React.ReactNode;
}

export function AIChat(props: AIChatProps): React.ReactElement {
    const { className } = props;
    const [isOpen, setIsOpen] = useState(false);

    function handleClick() {
        setIsOpen(!isOpen);
        document.body.classList.toggle('chat-open', !isOpen);
    }

    return (
        <div
            className={tcls(
                'fixed inset-y-4 right-4 z-40 w-96 rounded-md border border-tint-subtle bg-tint-subtle shadow-lg shadow-tint transition-all duration-300',
                'animate-exitToRight chat-open:animate-enterFromRight',
                className
            )}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleClick();
                }
            }}
        >
            <div className="flex items-center gap-2 p-4 font-bold text-sm text-tint-strong">
                <Icon icon="gitbook" className="size-4" />
                Chat
                <Icon
                    icon={isOpen ? 'chevron-down' : 'chevron-up'}
                    className="ml-auto size-4 text-tint-subtle"
                />
            </div>
        </div>
    );
}
