'use client';

import React from 'react';

import { useAI, useAIChatController } from '@/components/AI';
import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { getCodeText } from './utils';

export function AskAICodeButton(props: {
    codeId: string;
    syntax?: string;
    title?: string;
    style: ClassValue;
}) {
    const { codeId, syntax, title, style } = props;

    const language = useLanguage();
    const { assistants } = useAI();
    const chatController = useAIChatController();

    const assistant = assistants.find((a) => a.id === 'gitbook-assistant');
    if (!assistant) {
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

        chatController.addReference({ type: 'code-block', id: codeId, codeText, syntax, title });
        assistant.open();
    };

    // Strip the icon's size class so the Button's size controls it.
    const icon = React.isValidElement<{ className?: string }>(assistant.icon)
        ? React.cloneElement(assistant.icon, { className: '' })
        : assistant.icon;

    return (
        <Button
            size="xsmall"
            variant="secondary"
            icon={icon}
            onClick={onClick}
            className={tcls(style, 'translate-y-0!', 'print:hidden', '[[data-ai-chat]_&]:hidden')}
        >
            {t(language, 'ask')}
        </Button>
    );
}
