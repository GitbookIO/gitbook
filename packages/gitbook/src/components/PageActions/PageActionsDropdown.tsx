'use client';

import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type {
    CustomizationPageActionType,
    GitSyncState,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { type ReactNode, useRef } from 'react';
import { type Assistant, useAI } from '../AI';
import { ToggleChevron } from '../primitives';
import {
    ActionCopyMCPCommand,
    ActionCopyMCPURL,
    ActionCopyMarkdown,
    ActionOpenAssistant,
    ActionOpenEditOnGit,
    ActionOpenInLLM,
    ActionOpenMCP,
    ActionViewAsMarkdown,
    ActionViewAsPDF,
    ActionViewAsRSS,
    type PageActionAssistantContext,
} from './PageActions';

/**
 * Type of a built-in page action that can be displayed in the page actions menu.
 */
type PageActionType = `${CustomizationPageActionType}`;

export type PageActionsDropdownURLs = {
    html: string;
    markdown: string;
    mcp?: string;
    pdf?: string;
    rss?: string;
    editOnGit?: {
        provider: GitSyncState['installationProvider'];
        url: string;
    };
};

interface PageActionsDropdownProps {
    siteTitle: string;
    urls: PageActionsDropdownURLs;
    className?: string;
    actions: SiteCustomizationSettings['pageActions'];
    /** The current page, referenced by the assistant when opened. */
    page: PageActionAssistantContext;
}

/**
 * Dropdown menu for the page actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM…).
 *
 * The order and enabled state of the built-in actions are driven by `actions.items`, the ordered
 * list of enabled page actions, with its first available action shown as a quick-access button.
 * When the API does not provide `items` yet, the menu falls back to the previous ordering and
 * default-action priority so existing sites keep their current behavior.
 */
export function PageActionsDropdown(props: PageActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const language = useLanguage();
    const { siteTitle, urls } = props;

    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );
    const items = props.actions.items;

    let defaultAction: ReactNode = null;
    let markdownIsDefault = false;
    if (urls.rss) {
        // The RSS feed is not part of the configurable `items` list: it is only available on the
        // relevant pages (e.g. blog/changelog index). It is promoted as the default action whenever
        // present, as a contextual override of the configured list.
        defaultAction = <ActionViewAsRSS url={urls.rss} type="button" />;
    } else {
        const defaultActionType = items.find(
            (type) => items?.includes(type) && isActionTypeAvailable(type, urls, assistants)
        );
        if (defaultActionType) {
            defaultAction = renderDefaultActionForType(defaultActionType, {
                siteTitle,
                urls,
                assistants,
                page: props.page,
            });
            markdownIsDefault = defaultActionType === 'markdown';
        }
    }

    // Build the dropdown menu items, grouped by action type. RSS is appended as its own group
    // since it is not part of the configurable `items` list.
    const groups: { key: string; items: ReactNode[] }[] = items
        ? items
              .map((type) => ({
                  key: type,
                  items: renderDropdownActionsForType(type, {
                      siteTitle,
                      urls,
                      markdownIsDefault,
                      assistants,
                      page: props.page,
                  }),
              }))
              .filter((group) => group.items.length > 0)
        : [];

    if (urls.rss) {
        groups.push({
            key: 'rss',
            items: [<ActionViewAsRSS key="rss" url={urls.rss} type="dropdown-menu-item" />],
        });
    }

    // Count the actual menu items (not the groups): the dropdown toggle must stay visible when a
    // single action type still exposes more than one item beyond the default button (e.g. markdown
    // exposes both "Copy page" and "View as Markdown").
    const menuItemCount = groups.reduce((total, group) => total + group.items.length, 0);

    // Insert a separator before each group; the leading one is hidden via `first:hidden`.
    const dropdownActions = groups.flatMap((group) => [
        <DropdownMenuSeparator key={`separator-${group.key}`} className="first:hidden" />,
        ...group.items,
    ]);

    return defaultAction || menuItemCount > 0 ? (
        <ButtonGroup ref={ref} className={props.className}>
            {defaultAction}
            {!defaultAction || menuItemCount > 1 ? (
                <DropdownMenu
                    align="end"
                    className="!min-w-60 max-w-max"
                    button={
                        <Button
                            icon={<ToggleChevron className="size-text-sm" />}
                            label={tString(language, defaultAction ? 'more' : 'actions')}
                            iconOnly={!!defaultAction}
                            size="xsmall"
                            variant="secondary"
                            className="bg-tint-base"
                        />
                    }
                >
                    {dropdownActions}
                </DropdownMenu>
            ) : null}
        </ButtonGroup>
    ) : null;
}

/**
 * Whether an action type can be rendered given the available URLs and assistants.
 */
function isActionTypeAvailable(
    type: PageActionType,
    urls: PageActionsDropdownURLs,
    assistants: Assistant[]
): boolean {
    switch (type) {
        case 'assistant':
            return assistants.length > 0;
        case 'external-ai':
        case 'markdown':
            return true;
        case 'mcp':
            return !!urls.mcp;
        case 'git':
            return !!urls.editOnGit;
        case 'pdf':
            return !!urls.pdf;
        default:
            return false;
    }
}

/**
 * Render the list of menu items shown in the dropdown for a given action type.
 *
 * Returns a flat array of items (without separators); the caller groups them and inserts the
 * separators between groups.
 */
function renderDropdownActionsForType(
    type: PageActionType,
    params: {
        siteTitle: string;
        urls: PageActionsDropdownURLs;
        markdownIsDefault: boolean;
        assistants: Assistant[];
        page: PageActionAssistantContext;
    }
): ReactNode[] {
    const { siteTitle, urls, markdownIsDefault, assistants, page } = params;

    switch (type) {
        case 'assistant':
            return assistants.map((assistant) => (
                <ActionOpenAssistant
                    key={`assistant-${assistant.id}`}
                    assistant={assistant}
                    type="dropdown-menu-item"
                    page={page}
                />
            ));
        case 'external-ai':
            return [
                <ActionOpenInLLM
                    key="chatgpt"
                    provider="chatgpt"
                    url={urls.html}
                    type="dropdown-menu-item"
                />,
                <ActionOpenInLLM
                    key="claude"
                    provider="claude"
                    url={urls.html}
                    type="dropdown-menu-item"
                />,
            ];
        case 'markdown':
            return [
                <ActionCopyMarkdown
                    key="copy-markdown"
                    isDefaultAction={markdownIsDefault}
                    markdownPageURL={urls.markdown}
                    type="dropdown-menu-item"
                />,
                <ActionViewAsMarkdown
                    key="view-markdown"
                    markdownPageURL={urls.markdown}
                    type="dropdown-menu-item"
                />,
            ];
        case 'mcp':
            if (!urls.mcp) {
                return [];
            }
            return [
                <ActionCopyMCPURL key="copy-mcp" mcpURL={urls.mcp} type="dropdown-menu-item" />,
                <ActionOpenMCP
                    key="mcp-vscode"
                    provider="vscode"
                    mcpURL={urls.mcp}
                    siteTitle={siteTitle}
                    type="dropdown-menu-item"
                />,
                <ActionCopyMCPCommand
                    key="mcp-claude-code"
                    provider="claude-code"
                    mcpURL={urls.mcp}
                    siteTitle={siteTitle}
                    type="dropdown-menu-item"
                />,
                <ActionCopyMCPCommand
                    key="mcp-codex"
                    provider="codex"
                    mcpURL={urls.mcp}
                    siteTitle={siteTitle}
                    type="dropdown-menu-item"
                />,
            ];
        case 'git':
            if (!urls.editOnGit) {
                return [];
            }
            return [
                <ActionOpenEditOnGit
                    key="edit-git"
                    type="dropdown-menu-item"
                    provider={urls.editOnGit.provider}
                    url={urls.editOnGit.url}
                />,
            ];
        case 'pdf':
            if (!urls.pdf) {
                return [];
            }
            return [<ActionViewAsPDF key="pdf" url={urls.pdf} type="dropdown-menu-item" />];
        default:
            return [];
    }
}

/**
 * Render the action shown as the quick-access default button for a given action type.
 */
function renderDefaultActionForType(
    type: PageActionType,
    params: {
        siteTitle: string;
        urls: PageActionsDropdownURLs;
        assistants: Assistant[];
        page: PageActionAssistantContext;
    }
): ReactNode {
    const { urls, assistants, page } = params;

    switch (type) {
        case 'assistant':
            return assistants[0] ? (
                <ActionOpenAssistant assistant={assistants[0]} type="button" page={page} />
            ) : null;
        case 'external-ai':
            return <ActionOpenInLLM provider="chatgpt" url={urls.html} type="button" />;
        case 'markdown':
            return (
                <ActionCopyMarkdown isDefaultAction markdownPageURL={urls.markdown} type="button" />
            );
        case 'mcp':
            return urls.mcp ? <ActionCopyMCPURL mcpURL={urls.mcp} type="button" /> : null;
        case 'git':
            return urls.editOnGit ? (
                <ActionOpenEditOnGit
                    type="button"
                    provider={urls.editOnGit.provider}
                    url={urls.editOnGit.url}
                />
            ) : null;
        case 'pdf':
            return urls.pdf ? <ActionViewAsPDF url={urls.pdf} type="button" /> : null;
        default:
            return null;
    }
}
