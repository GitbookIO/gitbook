'use client';
import { tString, useLanguage } from '@/intl/client';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';
import AIChatIcon from './AIChatIcon';

export default function AIChatButton() {
    const chatController = useAIChatController();
    const chat = useAIChatState();

    const language = useLanguage();

    return (
        <Button
            icon={<AIChatIcon />}
            iconOnly
            size="default"
            variant="secondary"
            className="!px-3 bg-tint-base py-2.5"
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
