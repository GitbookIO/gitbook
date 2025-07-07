'use client';

import { useAIChatController, useAIChatState } from '@/components/AI/useAIChat';
import { ChatGPTIcon } from '@/components/AIActions/assets/ChatGPTIcon';
import { ClaudeIcon } from '@/components/AIActions/assets/ClaudeIcon';
import { MarkdownIcon } from '@/components/AIActions/assets/MarkdownIcon';
import AIChatIcon from '@/components/AIChat/AIChatIcon';
import { Button } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { useRef, useState } from 'react';

type AIAction = {
    icon?: IconName | React.ReactNode;
    label: string;
    description?: string;
    /**
     * Whether the action is an external link.
     */
    isExternal?: boolean;
    onClick?: () => void;
    disabled?: boolean;
};

export function AIActionsDropdown(props: {
    markdown?: string;
    markdownPageUrl: string;
    /**
     * Whether to include the "Ask Docs Assistant" entry in the dropdown menu. This **does not**
     * affect the standalone assistant button rendered next to the dropdown.
     * Defaults to `false` to avoid duplicating the action unless explicitly requested.
     */
    withAIChat?: boolean;
    pageURL: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const actions = useAIActions(props);

    // The default action is "Ask Docs Assistant" if the AI assistant is enabled, otherwise "Copy for LLMs"
    const defaultAction = actions[0];

    return (
        <div ref={ref} className="hidden h-fit items-stretch justify-start md:flex">
            <Button
                icon={defaultAction.icon}
                size="small"
                variant="secondary"
                label={defaultAction.label}
                className="hover:!scale-100 !shadow-none !rounded-r-none border-r-0 bg-tint-base text-sm"
                onClick={defaultAction.onClick}
                disabled={defaultAction.disabled}
            />
            <DropdownMenu
                contentProps={{
                    align: 'end',
                }}
                button={
                    <Button
                        icon="chevron-down"
                        iconOnly
                        size="small"
                        variant="secondary"
                        className="hover:!scale-100 !shadow-none !rounded-l-none bg-tint-base text-sm"
                    />
                }
            >
                {actions.map((action, index) => (
                    <DropdownMenuItem
                        onClick={action.onClick}
                        key={index}
                        className="flex items-stretch gap-2.5 p-2"
                    >
                        {action.icon ? (
                            <div className="mt-0.5 flex size-4 items-center text-tint">
                                {typeof action.icon === 'string' ? (
                                    <Icon
                                        icon={action.icon as IconName}
                                        iconStyle={IconStyle.Regular}
                                        className="size-full fill-transparent stroke-current"
                                    />
                                ) : (
                                    action.icon
                                )}
                            </div>
                        ) : null}
                        <div className="flex flex-1 flex-col gap-0.5">
                            <span className="flex items-center gap-2 text-tint-strong">
                                <span className="truncate font-medium text-sm">{action.label}</span>
                                {action.isExternal ? (
                                    <Icon icon="arrow-up-right" className="size-3" />
                                ) : null}
                            </span>
                            {action.description && (
                                <span className="truncate text-tint text-xs">
                                    {action.description}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenu>
        </div>
    );
}

function useAIActions(props: {
    markdown?: string;
    markdownPageUrl: string;
    pageURL: string;
    withAIChat?: boolean;
}): AIAction[] {
    const { markdown, markdownPageUrl, pageURL, withAIChat } = props;

    const chatController = useAIChatController();
    const chat = useAIChatState();
    const language = useLanguage();

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!markdown) return;
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDocsAssistant = () => {
        // Open the chat if it's not already open
        if (!chat.opened) {
            chatController.open();
        }

        // Send the "What is this page about?" message
        chatController.postMessage({
            message: tString(language, 'ai_chat_suggested_questions_about_this_page'),
        });
    };

    return [
        ...(withAIChat
            ? [
                  {
                      icon: chat.loading ? (
                          <Icon icon="spinner-third" className="size-4 animate-spin" />
                      ) : (
                          <AIChatIcon />
                      ),
                      label: 'Ask Docs Assistant',
                      description: 'Ask our Docs Assistant about this page',
                      onClick: handleDocsAssistant,
                      disabled: chat.loading || chat.error,
                  },
              ]
            : []),
        ...(markdown
            ? [
                  {
                      icon: copied ? 'check' : 'copy',
                      label: copied ? 'Copied!' : 'Copy for LLMs',
                      description: 'Copy page as Markdown',
                      onClick: handleCopy,
                  },
                  {
                      icon: <MarkdownIcon className="size-5 fill-current text-current" />,
                      label: 'View as Markdown',
                      description: 'View this page as plain text',
                      isExternal: true,
                      onClick: () => {
                          window.open(`${markdownPageUrl}.md`, '_blank');
                      },
                  },
              ]
            : []),
        {
            icon: <ChatGPTIcon className="mt-0.5 fill-current" />,
            label: 'Open in ChatGPT',
            description: 'Ask ChatGPT about this page',
            isExternal: true,
            onClick: () => {
                window.open(getLLMURL('chatgpt', pageURL), '_blank');
            },
        },
        {
            icon: <ClaudeIcon className="mt-0.5" />,
            label: 'Open in Claude',
            description: 'Ask Claude about this page',
            isExternal: true,
            onClick: () => window.open(getLLMURL('claude', pageURL), '_blank'),
        },
    ];
}

function getLLMURL(provider: 'chatgpt' | 'claude', url: string) {
    const prompt = encodeURIComponent(`Read ${url} and answer questions about the content.`);

    switch (provider) {
        case 'chatgpt':
            return `https://chat.openai.com/?q=${prompt}`;
        case 'claude':
            return `https://claude.ai/new?q=${prompt}`;
    }
}
