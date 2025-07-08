'use client';
import { t, useLanguage } from '@/intl/client';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import AIChatIcon from './AIChatIcon';

/**
 * Button to open/close the AI chat.
 */
export function AIChatButton() {
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
            label={
                <div className="flex items-center gap-2">
                    {t(language, 'ai_chat_assistant_name')}
                    <KeyboardShortcut keys={['mod', 'j']} className="border-tint-11 text-tint-1" />
                </div>
            }
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
