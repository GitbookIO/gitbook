'use client';

import { useAIChatController, useAIConfig } from '@/components/AI';
import { AIChatIcon } from '@/components/AIChat';
import { Button } from '@/components/primitives';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { getCodeTextFromId } from './utils';

export function AskAICodeButton(props: {
    codeId: string;
    title?: string;
    syntax?: string;
    style: ClassValue;
}) {
    const { codeId, title, syntax, style } = props;

    const language = useLanguage();
    const config = useAIConfig();
    const chatController = useAIChatController();

    if (!isAIChatEnabled(config.aiMode)) {
        return null;
    }

    const onClick = () => {
        const codeText = getCodeTextFromId(codeId);
        if (!codeText?.trim()) {
            return;
        }

        chatController.addReference({
            type: 'code-block',
            id: codeId,
            label: title ?? 'Code',
            content: codeText,
            syntax,
        });
        chatController.open();
        chatController.focus();
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
