'use client';

import { CustomizationAIMode } from '@gitbook/api';

import { useAIChatController, useAIConfig } from '@/components/AI';
import { AIChatIcon } from '@/components/AIChat';
import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { getCodeText } from './utils';

export function AskAICodeButton(props: {
    codeId: string;
    title?: string;
    style: ClassValue;
}) {
    const { codeId, title, style } = props;

    const language = useLanguage();
    const config = useAIConfig();
    const chatController = useAIChatController();

    if (config.aiMode !== CustomizationAIMode.Assistant) {
        return null;
    }

    const onClick = () => {
        const wrapper = document.getElementById(codeId);
        const element = wrapper?.querySelector('code');
        if (!element) {
            return;
        }
        const codeText = getCodeText(element);
        if (!codeText.trim()) {
            return;
        }

        chatController.addReference({
            type: 'code-block',
            id: codeId,
            label: title ?? 'Code',
            content: codeText,
        });
        chatController.open();
    };

    return (
        <Button
            size="xsmall"
            variant="secondary"
            icon={<AIChatIcon state="default" trademark={config.trademark} className="" />}
            onClick={onClick}
            className={tcls(style, 'translate-y-0!', 'print:hidden', '[[data-ai-chat]_&]:hidden')}
        >
            {t(language, 'ask')}
        </Button>
    );
}
