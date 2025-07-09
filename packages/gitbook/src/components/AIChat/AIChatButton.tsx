'use client';
import { tcls } from '@/lib/tailwind';
import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';
import { getAIChatName } from './AIChat';
import AIChatIcon from './AIChatIcon';

/**
 * Button to open/close the AI chat.
 */
export function AIChatButton(props: { trademark: boolean }) {
    const { trademark } = props;
    const chatController = useAIChatController();
    const chat = useAIChatState();

    return (
        <Button
            icon={<AIChatIcon trademark={trademark} />}
            iconOnly
            size="default"
            variant="header"
            className={tcls('h-9 px-2.5')}
            label={
                <div className="flex items-center gap-2">
                    {getAIChatName(trademark)}
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
