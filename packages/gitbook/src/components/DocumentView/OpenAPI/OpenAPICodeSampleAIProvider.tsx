'use client';

import { useAIChatController, useAIConfig } from '@/components/AI';
import { AIChatIcon, getAIChatName } from '@/components/AIChat';
import { useLanguage } from '@/intl/client';
import { CustomizationAIMode } from '@gitbook/api';
import {
    type OpenAPICodeSampleAssistant,
    OpenAPICodeSampleAssistantProvider,
} from '@gitbook/react-openapi';
import { useMemo } from 'react';

/**
 * Bridge the GitBook AI assistant into the OpenAPI code sample selector, so it can
 * offer a "Custom" option that opens the assistant pre-filled to rewrite a sample.
 *
 * When the assistant is not enabled, the provider passes `null` and the option is hidden.
 */
export function OpenAPICodeSampleAIProvider(props: { children: React.ReactNode }) {
    const { children } = props;
    const config = useAIConfig();
    const language = useLanguage();
    const chatController = useAIChatController();

    const assistant = useMemo<OpenAPICodeSampleAssistant | null>(() => {
        if (config.aiMode !== CustomizationAIMode.Assistant) {
            return null;
        }

        return {
            label: config.assistantName ?? getAIChatName(language, config.trademark),
            icon: (
                <AIChatIcon
                    state="default"
                    trademark={config.trademark}
                    className="size-4 shrink-0"
                />
            ),
            onRewrite: ({ id, code, syntax, label, prompt }) => {
                if (!code.trim()) {
                    return;
                }
                chatController.addReference({
                    type: 'code-block',
                    id,
                    label: label ?? 'Code',
                    content: code,
                    syntax,
                });
                chatController.setDraft(prompt);
                chatController.open();
                chatController.focus();
            },
        };
    }, [config.aiMode, config.assistantName, config.trademark, language, chatController]);

    return (
        <OpenAPICodeSampleAssistantProvider value={assistant}>
            {children}
        </OpenAPICodeSampleAssistantProvider>
    );
}
