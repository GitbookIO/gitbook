'use client';

import { useAIChatController } from '@/components/AI/useAIChat';
import { useAIChatState } from '@/components/AI/useAIChat';
import { ChatGPTIcon } from '@/components/AIActions/assets/ChatGPTIcon';
import { ClaudeIcon } from '@/components/AIActions/assets/ClaudeIcon';
import { MarkdownIcon } from '@/components/AIActions/assets/MarkdownIcon';
import { useCopyMarkdown } from '@/components/AIActions/assets/useCopyMarkdown';
import { getAIChatName } from '@/components/AIChat';
import AIChatIcon from '@/components/AIChat/AIChatIcon';
import { Button } from '@/components/primitives/Button';
import { DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';

type AIActionType = 'button' | 'dropdown-menu-item';

/**
 * Opens our AI Docs Assistant.
 */
export function OpenDocsAssistant(props: { type: AIActionType; trademark: boolean }) {
    const { type, trademark } = props;
    const chatController = useAIChatController();
    const chat = useAIChatState();
    const language = useLanguage();

    return (
        <AIActionWrapper
            type={type}
            icon={
                <AIChatIcon state={chat.loading ? 'thinking' : 'default'} trademark={trademark} />
            }
            label={tString(language, 'ai_chat_ask', getAIChatName(trademark))}
            shortLabel={tString(language, 'ask')}
            description={tString(language, 'ai_chat_ask_about_page', getAIChatName(trademark))}
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

// We need to store the copied state in a store to share the state between the
// copy button and the dropdown menu item.
const useCopiedStore = create<{
    copied: boolean;
    setCopied: (copied: boolean) => void;
}>((set) => ({
    copied: false,
    setCopied: (copied: boolean) => set({ copied }),
}));

/**
 * Copies the markdown version of the page to the clipboard.
 */
export function CopyMarkdown(props: {
    markdownPageUrl: string;
    type: AIActionType;
    isDefaultAction?: boolean;
}) {
    const { markdownPageUrl, type, isDefaultAction } = props;
    const language = useLanguage();
    const { copied, setCopied } = useCopiedStore();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { fetchMarkdown, copyMarkdown, isLoading } = useCopyMarkdown(markdownPageUrl);

    // Close the dropdown menu manually after the copy button is clicked
    const closeDropdownMenu = () => {
        const dropdownMenu = document.querySelector('div[data-radix-popper-content-wrapper]');

        // Cancel if no dropdown menu is open
        if (!dropdownMenu) return;

        // Dispatch on `document` so that the event is captured by Radix's
        // dismissable-layer listener regardless of focus location.
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const onClick = (e: React.MouseEvent) => {
        // Prevent default behavior for non-default actions to avoid closing the dropdown.
        // This allows showing transient UI (e.g., a "copied" state) inside the menu item.
        // Default action buttons are excluded from this behavior.
        if (!isDefaultAction) {
            e.preventDefault();
        }

        // Cancel any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Copy the markdown to the clipboard
        copyMarkdown();

        setCopied(true);

        // Reset the copied state after 2 seconds
        timeoutRef.current = setTimeout(() => {
            // Close the dropdown menu if it's a dropdown menu item and not the default action
            if (type === 'dropdown-menu-item' && !isDefaultAction) {
                closeDropdownMenu();
            }

            setCopied(false);
        }, 2000);
    };

    return (
        <AIActionWrapper
            type={type}
            icon={copied ? 'check' : 'copy'}
            label={copied ? tString(language, 'code_copied') : tString(language, 'copy_page')}
            shortLabel={copied ? tString(language, 'code_copied') : tString(language, 'code_copy')}
            description={tString(language, 'copy_page_markdown')}
            onClick={onClick}
            onMouseEnter={fetchMarkdown}
            isLoading={isLoading}
        />
    );
}

/**
 * Redirects to the markdown version of the page.
 */
export function ViewAsMarkdown(props: { markdownPageUrl: string; type: AIActionType }) {
    const { markdownPageUrl, type } = props;
    const language = useLanguage();

    return (
        <AIActionWrapper
            type={type}
            icon={<MarkdownIcon className="size-4 fill-current" />}
            label={tString(language, 'view_page_markdown')}
            description={tString(language, 'view_page_plaintext')}
            href={markdownPageUrl}
        />
    );
}

/**
 * Open the page in a LLM with a pre-filled prompt. Either ChatGPT or Claude.
 */
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

/**
 * Wraps an action in a button (for the default action) or dropdown menu item.
 */
function AIActionWrapper(props: {
    type: AIActionType;
    icon: IconName | React.ReactNode;
    label: string;
    /**
     * The label to display in the button. If not provided, the `label` will be used.
     */
    shortLabel?: string;
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: () => void;
    description?: string;
    href?: string;
    disabled?: boolean;
    isLoading?: boolean;
}) {
    const {
        type,
        icon,
        label,
        shortLabel,
        onClick,
        onMouseEnter,
        href,
        description,
        disabled,
        isLoading,
    } = props;

    if (type === 'button') {
        return (
            <Button
                icon={
                    isLoading ? <Icon icon="spinner-third" className="size-4 animate-spin" /> : icon
                }
                size="xsmall"
                variant="secondary"
                label={shortLabel || label}
                className="hover:!scale-100 !shadow-none !rounded-r-none border-r-0 bg-tint-base text-sm"
                onClick={onClick}
                href={href}
                target={href ? '_blank' : undefined}
                disabled={disabled || isLoading}
                onMouseEnter={onMouseEnter}
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
            onMouseEnter={onMouseEnter}
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
            <div className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-tint-strong">
                    <span className="truncate font-medium text-sm">{label}</span>
                    {href ? <Icon icon="arrow-up-right" className="size-3" /> : null}
                </span>
                {description && <span className="truncate text-tint text-xs">{description}</span>}
            </div>
        </DropdownMenuItem>
    );
}

/**
 * Returns the URL to open the page in a LLM with a pre-filled prompt.
 */
function getLLMURL(provider: 'chatgpt' | 'claude', url: string, language: TranslationLanguage) {
    const prompt = encodeURIComponent(tString(language, 'open_in_llms_pre_prompt', url));

    switch (provider) {
        case 'chatgpt':
            return `https://chat.openai.com/?q=${prompt}`;
        case 'claude':
            return `https://claude.ai/new?q=${prompt}`;
        default:
            assertNever(provider);
    }
}
