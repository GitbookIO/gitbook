'use client';

import { useAIChatController, useAIChatState } from '../AI/useAIChat';
import { Button } from '../primitives';

export default function AIChatButton() {
    const chatController = useAIChatController();
    const chat = useAIChatState();

    return (
        <Button
            icon="robot"
            iconOnly
            size="default"
            variant="secondary"
            className="!px-3 bg-tint-base py-2.5"
            label="Docs Assistant"
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
