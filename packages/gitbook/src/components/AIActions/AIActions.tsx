'use client';

import { useAIChatController } from '@/components/AI/useAIChat';
import { useAIChatState } from '@/components/AI/useAIChat';
import { ChatGPTIcon } from '@/components/AIActions/assets/ChatGPTIcon';
import { ClaudeIcon } from '@/components/AIActions/assets/ClaudeIcon';
import { MarkdownIcon } from '@/components/AIActions/assets/MarkdownIcon';
import AIChatIcon from '@/components/AIChat/AIChatIcon';
import { Button } from '@/components/primitives/Button';
import { DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { useState } from 'react';

type AIActionType = 'button' | 'dropdown-menu-item';

export function OpenDocsAssistant(props: { type: AIActionType }) {
    const { type } = props;
    const chatController = useAIChatController();
    const chat = useAIChatState();
    const language = useLanguage();

    return (
        <AIActionWrapper
            type={type}
            icon={
                chat.loading ? (
                    <Icon icon="spinner-third" className="size-3.5 animate-spin" />
                ) : (
                    <AIChatIcon />
                )
            }
            label={tString(language, 'ai_chat_ask', tString(language, 'ai_chat_assistant_name'))}
            shortLabel={tString(language, 'ask')}
            description={tString(
                language,
                'ai_chat_ask_about_page',
                tString(language, 'ai_chat_assistant_name')
            )}
            disabled={chat.loading}
            onClick={() => {
                // Open the chat if it's not already open
                if (!chat.opened) {
                    chatController.open();
                }

                // Send the "What is this page about?" message
                chatController.postMessage({
                    message: tString(language, 'ai_chat_suggested_questions_about_this_page'),
                });
            }}
        />
    );
}

export function CopyMarkdown(props: { markdown: string; type: AIActionType }) {
    const { markdown, type } = props;
    const [copied, setCopied] = useState(false);
    const language = useLanguage();

    // Close the dropdown menu manually after the copy button is clicked
    const closeDropdownMenu = () => {
        const dropdownMenu = document.querySelector('div[data-radix-popper-content-wrapper]');

        // Cancel if no dropdown menu is open
        if (!dropdownMenu) return;

        // Dispatch on `document` so that the event is captured by Radix's
        // dismissable-layer listener regardless of focus location.
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    };

    return (
        <AIActionWrapper
            type={type}
            icon={copied ? 'check' : 'copy'}
            label={copied ? tString(language, 'code_copied') : tString(language, 'copy_page')}
            description={tString(language, 'copy_page_markdown')}
            onClick={(e) => {
                e.preventDefault();

                if (!markdown) return;
                navigator.clipboard.writeText(markdown);
                setCopied(true);

                setTimeout(() => {
                    if (type === 'dropdown-menu-item') {
                        closeDropdownMenu();
                    }

                    setCopied(false);
                }, 2000);
            }}
        />
    );
}

export function ViewAsMarkdown(props: { markdownPageUrl: string; type: AIActionType }) {
    const { markdownPageUrl, type } = props;
    const language = useLanguage();

    return (
        <AIActionWrapper
            type={type}
            icon={<MarkdownIcon className="size-4 fill-current" />}
            label={tString(language, 'view_page_markdown')}
            description={tString(language, 'view_page_plaintext')}
            href={`${markdownPageUrl}.md`}
        />
    );
}

export function OpenInLLM(props: {
    provider: 'chatgpt' | 'claude';
    url: string;
    type: AIActionType;
}) {
    const { provider, url, type } = props;
    const language = useLanguage();

    const providerLabel = provider === 'chatgpt' ? 'ChatGPT' : 'Claude';

    return (
        <AIActionWrapper
            type={type}
            icon={
                provider === 'chatgpt' ? (
                    <ChatGPTIcon className="size-3.5 fill-current" />
                ) : (
                    <ClaudeIcon className="size-3.5 fill-current" />
                )
            }
            label={tString(language, 'open_in', providerLabel)}
            shortLabel={providerLabel}
            description={tString(language, 'ai_chat_ask_about_page', providerLabel)}
            href={getLLMURL(provider, url, language)}
        />
    );
}

function AIActionWrapper(props: {
    type: AIActionType;
    icon: IconName | React.ReactNode;
    label: string;
    /**
     * The label to display in the button. If not provided, the `label` will be used.
     */
    shortLabel?: string;
    onClick?: (e: React.MouseEvent) => void;
    description?: string;
    href?: string;
    disabled?: boolean;
}) {
    const { type, icon, label, shortLabel, onClick, href, description, disabled } = props;

    if (type === 'button') {
        return (
            <Button
                icon={icon}
                size="small"
                variant="secondary"
                label={shortLabel || label}
                className="hover:!scale-100 !shadow-none !rounded-r-none border-r-0 bg-tint-base text-sm"
                onClick={onClick}
                href={href}
                target={href ? '_blank' : undefined}
                disabled={disabled}
            />
        );
    }

    return (
        <DropdownMenuItem
            className="flex items-stretch gap-2.5 p-2"
            href={href}
            target="_blank"
            onClick={onClick}
            disabled={disabled}
        >
            {icon ? (
                <div className="flex size-5 items-center justify-center text-tint">
                    {typeof icon === 'string' ? (
                        <Icon
                            icon={icon as IconName}
                            iconStyle={IconStyle.Regular}
                            className="size-4 fill-transparent stroke-current"
                        />
                    ) : (
                        icon
                    )}
                </div>
            ) : null}
            <div className="flex flex-1 flex-col gap-0.5 *:leading-none">
                <span className="flex items-center gap-2 text-tint-strong">
                    <span className="truncate font-medium text-sm">{label}</span>
                    {href ? <Icon icon="arrow-up-right" className="size-3" /> : null}
                </span>
                {description && <span className="truncate text-tint text-xs">{description}</span>}
            </div>
        </DropdownMenuItem>
    );
}

function getLLMURL(provider: 'chatgpt' | 'claude', url: string, language: TranslationLanguage) {
    const prompt = encodeURIComponent(tString(language, 'open_in_llms_pre_prompt', url));

    switch (provider) {
        case 'chatgpt':
            return `https://chat.openai.com/?q=${prompt}`;
        case 'claude':
            return `https://claude.ai/new?q=${prompt}`;
    }
}
