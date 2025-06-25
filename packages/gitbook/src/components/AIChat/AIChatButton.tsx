'use client';

import { useAIChatController } from '../AI/useAIChat';
import { Button } from '../primitives';

export default function AIChatButton() {
    const chatController = useAIChatController();

    return (
        <Button
            icon="robot"
            iconOnly
            size="default"
            variant="secondary"
            className="!px-3 bg-tint-base py-2.5"
            label="Ask AI"
            onClick={() => {
                chatController.open();
            }}
        />
    );
}
