'use client';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';
import { AIChatIcon } from './AIChatIcon';

/**
 * Button to open/close the AI chat.
 */
export function AIChatButton(props: { className?: string }) {
    const chatController = useAIChatController();
    const chat = useAIChatState();

    const language = useLanguage();

    return (
        <Button
            icon={<AIChatIcon />}
            iconOnly
            size="default"
            variant="header"
            className={tcls('h-9 px-2.5', props.className)}
            label={tString(language, 'ai_chat_assistant_name')}
            onClick={() => {
                if (chat.opened) {
                    chatController.close();
                } else {
                    chatController.open();
                }
            }}
        />
    );
}
