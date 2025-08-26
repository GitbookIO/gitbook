'use client';

import { useLanguage } from '@/intl/client';
import { t, tString } from '@/intl/translate';
import { Icon } from '@gitbook/icons';
import { useAIChatController, useAIChatState } from '../AI';
import { Button, DropdownMenu, DropdownMenuItem } from '../primitives';

/**
 * Button to control the chat (clear, etc.)
 */
export function AIChatControlButton() {
    const language = useLanguage();
    const chat = useAIChatState();
    const chatController = useAIChatController();

    return chat.messages.length > 0 ? (
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
            >
                <Icon icon="broom-wide" className="size-3 shrink-0 text-tint-subtle" />
                {t(language, 'ai_chat_clear_conversation')}
            </DropdownMenuItem>
        </DropdownMenu>
    ) : null;
}
