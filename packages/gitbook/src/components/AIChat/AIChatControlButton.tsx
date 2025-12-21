'use client';

import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { useAIChatController, useAIChatState } from '../AI';
import { Button } from '../primitives';

/**
 * Button to control the chat (clear, etc.)
 */
export function AIChatControlButton() {
    const language = useLanguage();
    const chat = useAIChatState();
    const chatController = useAIChatController();

    return chat.messages.length > 0 ? (
        <Button
            onClick={() => {
                chatController.clear();
            }}
            iconOnly
            icon="trash-can"
            label={t(language, 'ai_chat_clear_conversation')}
            variant="blank"
            className="animate-blur-in-slow"
        />
    ) : null;
}
