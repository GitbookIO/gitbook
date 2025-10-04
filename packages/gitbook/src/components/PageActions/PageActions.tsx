'use client';

import { useAIChatState } from '@/components/AI';
import type { Assistant } from '@/components/AI';
import { Button } from '@/components/primitives/Button';
import { DropdownMenuItem, useDropdownMenuClose } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import type { GitSyncState } from '@gitbook/api';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';
import QuickLRU from 'quick-lru';
import React from 'react';
import { create } from 'zustand';

type PageActionType = 'button' | 'dropdown-menu-item';

/**
 * Action to open the GitBook Assistant.
 */
export function ActionOpenAssistant(props: { assistant: Assistant; type: PageActionType }) {
    const { assistant, type } = props;
    const chat = useAIChatState();
    const language = useLanguage();

    return (
        <PageActionWrapper
            type={type}
            icon={assistant.icon}
            label={assistant.label}
            shortLabel={tString(language, 'ask')}
            description={tString(language, 'ai_chat_ask_about_page', assistant.label)}
            disabled={chat.loading}
            onClick={() => {
                assistant.open(tString(language, 'ai_chat_suggested_questions_about_this_page'));
            }}
        />
    );
}

type CopiedStore = {
    copied: boolean;
    loading: boolean;
};

// We need to store everything in a store to share the state between every instance of the component.
const useCopiedStore = create<
    CopiedStore & {
        setLoading: (loading: boolean) => void;
        copy: (data: string, opts?: { onSuccess?: () => void }) => void;
    }
>((set) => {
    let timeoutRef: ReturnType<typeof setTimeout> | null = null;

    return {
        copied: false,
        loading: false,
        setLoading: (loading: boolean) => set({ loading }),
        copy: async (data, opts) => {
            const { onSuccess } = opts || {};

            if (timeoutRef) {
                clearTimeout(timeoutRef);
            }

            await navigator.clipboard.writeText(data);

            set({ copied: true });

            timeoutRef = setTimeout(() => {
                set({ copied: false });
                onSuccess?.();

                // Reset the timeout ref to avoid multiple timeouts
                timeoutRef = null;
            }, 1500);
        },
    };
});

/**
 * Cache for the markdown versbion of the page.
 */
const markdownCache = new QuickLRU<string, string>({ maxSize: 10 });

/**
 * Action to copy the markdown version of the page to the clipboard.
 */
export function ActionCopyMarkdown(props: {
    markdownPageURL: string;
    type: PageActionType;
    isDefaultAction?: boolean;
}) {
    const { markdownPageURL, type, isDefaultAction } = props;
    const language = useLanguage();

    const closeDropdown = useDropdownMenuClose();

    const { copied, loading, setLoading, copy } = useCopiedStore();

    // Fetch the markdown from the page
    const fetchMarkdown = async () => {
        setLoading(true);

        const result = await fetch(markdownPageURL).then((res) => res.text());
        markdownCache.set(markdownPageURL, result);

        setLoading(false);

        return result;
    };

    const onClick = async (e: React.MouseEvent) => {
        // Prevent default behavior for non-default actions to avoid closing the dropdown.
        // This allows showing transient UI (e.g., a "copied" state) inside the menu item.
        if (!isDefaultAction) {
            e.preventDefault();
        }

        copy(markdownCache.get(markdownPageURL) || (await fetchMarkdown()), {
            onSuccess: () => {
                // We close the dropdown menu if the action is a dropdown menu item and not the default action.
                if (type === 'dropdown-menu-item' && !isDefaultAction) {
                    closeDropdown();
                }
            },
        });
    };

    return (
        <PageActionWrapper
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
export function ActionViewAsMarkdown(props: { markdownPageURL: string; type: PageActionType }) {
    const { markdownPageURL, type } = props;
    const language = useLanguage();

    return (
        <PageActionWrapper
            type={type}
            icon="markdown"
            label={tString(language, 'view_page_markdown')}
            description={tString(language, 'view_page_plaintext')}
            href={markdownPageURL}
        />
    );
}

/**
 * Open the page in a LLM with a pre-filled prompt. Either ChatGPT or Claude.
 */
export function ActionOpenInLLM(props: {
    provider: 'chatgpt' | 'claude';
    url: string;
    type: PageActionType;
}) {
    const { provider, url, type } = props;
    const language = useLanguage();

    const providerLabel = provider === 'chatgpt' ? 'ChatGPT' : 'Claude';

    return (
        <PageActionWrapper
            type={type}
            icon={provider}
            label={tString(language, 'open_in', providerLabel)}
            shortLabel={providerLabel}
            description={tString(language, 'ai_chat_ask_about_page', providerLabel)}
            href={getLLMURL(provider, url, language)}
        />
    );
}

/**
 * Action to open the page in the associated Git repository.
 */
export function ActionOpenEditOnGit(props: {
    type: PageActionType;
    provider: GitSyncState['installationProvider'];
    url: string;
}) {
    const { type, provider, url } = props;
    const language = useLanguage();

    const providerName =
        provider === 'github' ? 'GitHub' : provider === 'gitlab' ? 'GitLab' : 'Git';

    return (
        <PageActionWrapper
            type={type}
            icon={provider === 'gitlab' ? 'gitlab' : 'github'}
            label={tString(language, 'edit_on_git', providerName)}
            shortLabel={tString(language, 'edit')}
            href={url}
        />
    );
}

/**
 * Action to copy the MCP URL to the clipboard.
 */
export function ActionCopyMCPURL(props: { mcpURL: string; type: PageActionType }) {
    const { mcpURL, type } = props;
    const language = useLanguage();

    return (
        <CopyToClipboard
            type={type}
            data={mcpURL}
            label={tString(language, 'connect_with_mcp')}
            description={tString(language, 'copy_mcp_url')}
            icon="mcp"
        />
    );
}

/**
 * Action to open the MCP server in a specific editor.
 */
export function ActionOpenMCP(props: {
    siteTitle: string;
    mcpURL: string;
    provider: 'vscode';
    type: PageActionType;
}) {
    const { siteTitle, provider, mcpURL, type } = props;
    const language = useLanguage();

    const providerInfo = React.useMemo<{ label: string; icon: IconName; url: string }>(() => {
        switch (provider) {
            case 'vscode': {
                const vscodeConfig = { name: siteTitle, url: mcpURL };
                return {
                    label: 'VSCode',
                    icon: 'vscode',
                    url: `vscode:mcp/install?${encodeURIComponent(JSON.stringify(vscodeConfig))}`,
                };
            }
            default:
                assertNever(provider);
        }
    }, [provider, mcpURL, siteTitle]);

    return (
        <PageActionWrapper
            type={type}
            href={providerInfo.url}
            label={tString(language, 'connect_mcp_to', providerInfo.label)}
            description={tString(language, 'install_mcp_on', providerInfo.label)}
            icon={providerInfo.icon}
        />
    );
}

/**
 * Action to view the page as a PDF.
 */
export function ActionViewAsPDF(props: { url: string; type: PageActionType }) {
    const { url, type } = props;
    const language = useLanguage();

    return (
        <PageActionWrapper
            type={type}
            icon="file-pdf"
            label={tString(language, 'pdf_download')}
            href={url}
            target="_self"
        />
    );
}

/**
 * Action to copy a string to the clipboard.
 */
export function CopyToClipboard(props: {
    type: PageActionType;
    data: string;
    label: string;
    description: string;
    icon: IconName;
}) {
    const { type, data, label, description, icon } = props;
    return (
        <PageActionWrapper
            type={type}
            icon={icon}
            label={label}
            description={description}
            onClick={() => {
                navigator.clipboard.writeText(data);
            }}
        />
    );
}

/**
 * Wraps an action in a button (for the default action) or dropdown menu item.
 */
function PageActionWrapper(props: {
    type: PageActionType;
    icon: IconName | React.ReactNode;
    label: string;
    /**
     * The label to display in the button. If not provided, the `label` will be used.
     */
    shortLabel?: string;
    onClick?: (e: React.MouseEvent) => void;
    description?: string;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    disabled?: boolean;
    loading?: boolean;
}) {
    const {
        type,
        icon,
        label,
        shortLabel,
        onClick,
        href,
        target = '_blank',
        description,
        disabled,
        loading,
    } = props;

    if (type === 'button') {
        return (
            <Button
                icon={
                    loading ? <Icon icon="spinner-third" className="size-4 animate-spin" /> : icon
                }
                size="xsmall"
                variant="secondary"
                label={label ?? shortLabel}
                className="bg-tint-base text-sm"
                onClick={onClick}
                href={href}
                target={href ? target : undefined}
                disabled={disabled || loading}
            >
                {shortLabel}
            </Button>
        );
    }

    return (
        <DropdownMenuItem
            className="flex items-stretch gap-2.5 p-2"
            href={href}
            target={target}
            onClick={onClick}
            disabled={disabled || loading}
        >
            <div className="flex size-5 items-center justify-center text-tint">
                {loading ? (
                    <Icon icon="spinner-third" className="size-4 shrink-0 animate-spin" />
                ) : icon ? (
                    typeof icon === 'string' ? (
                        <Icon
                            icon={icon as IconName}
                            iconStyle={IconStyle.Regular}
                            className="size-4 shrink-0 fill-transparent stroke-current"
                        />
                    ) : (
                        icon
                    )
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1 text-tint-strong">
                    <span className="truncate font-medium text-sm">{label}</span>
                    {href && target === '_blank' ? (
                        <Icon icon="arrow-up-right" className="size-3 shrink-0 text-tint-subtle" />
                    ) : null}
                </span>
                {description && <span className="text-tint text-xs">{description}</span>}
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
