'use client';

import { useAIChatController } from '@/components/AI/useAIChat';
import { useAIChatState } from '@/components/AI/useAIChat';
import { ChatGPTIcon } from '@/components/AIActions/assets/ChatGPTIcon';
import { ClaudeIcon } from '@/components/AIActions/assets/ClaudeIcon';
import { MarkdownIcon } from '@/components/AIActions/assets/MarkdownIcon';
import { getAIChatName } from '@/components/AIChat';
import { AIChatIcon } from '@/components/AIChat';
import { Button } from '@/components/primitives/Button';
import { DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';
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

type CopiedStore = {
    markdown: string | null;
    copied: boolean;
    loading: boolean;
    pathname: string;
};

// We need to store everything in a store to share the state between every instance of the component.
const useCopiedStore = create<
    CopiedStore & {
        setState: (partial: Partial<CopiedStore>) => void;
        copyWithTimeout: (props: { markdown: string; shouldCloseDropdown: boolean }) => void;
    }
>((set) => {
    let timeoutRef: ReturnType<typeof setTimeout> | null = null;

    return {
        markdown: null,
        copied: false,
        loading: false,
        pathname: '',
        setState: (partial: Partial<CopiedStore>) => set((state) => ({ ...state, ...partial })),
        copyWithTimeout: async (props) => {
            const { markdown, shouldCloseDropdown } = props;

            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }

            await navigator.clipboard.writeText(markdown);

            set({ copied: true, markdown, loading: false });

            timeoutRef = setTimeout(() => {
                set({ copied: false });
                timeoutRef = null;

                if (shouldCloseDropdown) {
                    closeDropdown();
                }
            }, 1500);
        },
    };
});

/**
 * Function to manually close the dropdown
 */
function closeDropdown() {
    const dropdownMenu = document.querySelector('div[data-radix-popper-content-wrapper]');
    if (!dropdownMenu) return;

    // Dispatch on `document` so that the event is captured by Radix's
    // dismissable-layer listener regardless of focus location.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

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
    const basePathname = usePathname();
    const { copied, loading, markdown, pathname, setState, copyWithTimeout } = useCopiedStore();

    // Clear cached markdown when navigating to a new page
    useEffect(() => {
        if (basePathname && pathname !== basePathname) {
            setState({ markdown: null, pathname: basePathname });
        }
    }, [basePathname, pathname, setState]);

    // Fetch the markdown from the page
    const fetchMarkdown = async () => {
        setState({ loading: true });

        return fetch(markdownPageUrl)
            .then((res) => res.text())
            .finally(() => setState({ loading: false }));
    };

    const onClick = async (e: React.MouseEvent) => {
        // Prevent default behavior for non-default actions to avoid closing the dropdown.
        // This allows showing transient UI (e.g., a "copied" state) inside the menu item.
        if (!isDefaultAction) {
            e.preventDefault();
        }

        copyWithTimeout({
            markdown: markdown || (await fetchMarkdown()),
            shouldCloseDropdown: type === 'dropdown-menu-item' && !isDefaultAction,
        });
    };

    return (
        <AIActionWrapper
            type={type}
            icon={copied ? 'check' : 'copy'}
            label={copied ? tString(language, 'code_copied') : tString(language, 'copy_page')}
            shortLabel={copied ? tString(language, 'code_copied') : tString(language, 'code_copy')}
            description={tString(language, 'copy_page_markdown')}
            onClick={onClick}
            loading={loading}
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
    description?: string;
    href?: string;
    disabled?: boolean;
    loading?: boolean;
}) {
    const { type, icon, label, shortLabel, onClick, href, description, disabled, loading } = props;

    if (type === 'button') {
        return (
            <Button
                icon={
                    loading ? <Icon icon="spinner-third" className="size-4 animate-spin" /> : icon
                }
                size="xsmall"
                variant="secondary"
                label={shortLabel || label}
                className="hover:!scale-100 !shadow-none !rounded-r-none border-r-0 bg-tint-base text-sm"
                onClick={onClick}
                href={href}
                target={href ? '_blank' : undefined}
                disabled={disabled || loading}
            />
        );
    }

    return (
        <DropdownMenuItem
            className="flex items-stretch gap-2.5 p-2"
            href={href}
            target="_blank"
            onClick={onClick}
            disabled={disabled || loading}
        >
            <div className="flex size-5 items-center justify-center text-tint">
                {loading ? (
                    <Icon icon="spinner-third" className="size-4 animate-spin" />
                ) : icon ? (
                    typeof icon === 'string' ? (
                        <Icon
                            icon={icon as IconName}
                            iconStyle={IconStyle.Regular}
                            className="size-4 fill-transparent stroke-current"
                        />
                    ) : (
                        icon
                    )
                ) : null}
            </div>

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
