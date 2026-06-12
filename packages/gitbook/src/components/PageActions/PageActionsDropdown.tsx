'use client';

import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { GitSyncState, SiteCustomizationSettings } from '@gitbook/api';
import React, { useRef } from 'react';
import { useAI } from '../AI';
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
 *
 * TODO: this type is not yet exposed by `@gitbook/api`. We mirror it here until the API
 * client is updated. Once `CustomizationPageActionType` and `pageActions.items` are part
 * of the API, import the type from `@gitbook/api` and remove the `@ts-expect-error` below.
 */
type CustomizationPageActionType = 'external-ai' | 'markdown' | 'mcp' | 'git' | 'pdf';

/**
 * Default display order of the built-in page actions, used to derive the ordered list
 * for sites that don't have an explicit `items` configuration (legacy boolean flags).
 */
const DEFAULT_PAGE_ACTION_ORDER: CustomizationPageActionType[] = [
    'external-ai',
    'markdown',
    'mcp',
    'git',
    'pdf',
];

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
 * list of enabled page actions. The first available action in that list is shown as a quick-access
 * button next to the dropdown.
 */
export function PageActionsDropdown(props: PageActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const language = useLanguage();
    const { siteTitle, urls } = props;

    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );
    const items = getPageActionItems(props.actions);

    // The quick-access button next to the dropdown is the first action of the configured list.
    // The RSS feed and the AI assistant are not part of the configurable `items`, so they are only
    // used as a fallback default when no configured action is available (to keep a button visible).
    const firstAvailableItem = items.find((type) => isActionTypeAvailable(type, urls));

    let defaultAction: React.ReactNode = null;
    let markdownIsDefault = false;
    if (firstAvailableItem) {
        defaultAction = renderDefaultActionForType(firstAvailableItem, { siteTitle, urls });
        markdownIsDefault = firstAvailableItem === 'markdown';
    } else if (urls.rss) {
        defaultAction = <ActionViewAsRSS url={urls.rss} type="button" />;
    } else if (assistants[0]) {
        defaultAction = (
            <ActionOpenAssistant assistant={assistants[0]} type="button" page={props.page} />
        );
    }

    const dropdownActions: React.ReactNode[] = [
        ...assistants.map((assistant) => (
            <ActionOpenAssistant
                key={assistant.label}
                assistant={assistant}
                type="dropdown-menu-item"
                page={props.page}
            />
        )),
        ...items.map((type) =>
            renderDropdownActionsForType(type, { siteTitle, urls, markdownIsDefault })
        ),
        urls.rss ? (
            <React.Fragment key="rss">
                <DropdownMenuSeparator className="first:hidden" />
                <ActionViewAsRSS url={urls.rss} type="dropdown-menu-item" />
            </React.Fragment>
        ) : null,
    ].filter(Boolean);

    return defaultAction || dropdownActions.length > 0 ? (
        <ButtonGroup ref={ref} className={props.className}>
            {defaultAction}
            {!defaultAction || dropdownActions.length > 1 ? (
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
 * Return the ordered list of enabled page actions.
 *
 * `actions.items` is the source of truth. When it is not provided (older API responses), the list
 * is derived from the deprecated boolean flags following the default page action order.
 */
function getPageActionItems(
    actions: SiteCustomizationSettings['pageActions']
): CustomizationPageActionType[] {
    // @ts-expect-error - `items` is not yet part of the `@gitbook/api` types. Remove this once it is.
    const items: CustomizationPageActionType[] | undefined = actions.items;
    if (items) {
        return items;
    }

    return DEFAULT_PAGE_ACTION_ORDER.filter((type) => {
        switch (type) {
            case 'external-ai':
                return actions.externalAI;
            case 'markdown':
                return actions.markdown;
            case 'mcp':
                return actions.mcp;
            // `git` and `pdf` are not represented by the legacy `pageActions` flags;
            // they are gated by URL availability at render time.
            case 'git':
            case 'pdf':
                return true;
            default:
                return false;
        }
    });
}

/**
 * Whether an action type can be rendered given the available URLs.
 */
function isActionTypeAvailable(
    type: CustomizationPageActionType,
    urls: PageActionsDropdownURLs
): boolean {
    switch (type) {
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
 * Render the action(s) shown in the dropdown menu for a given action type.
 */
function renderDropdownActionsForType(
    type: CustomizationPageActionType,
    params: { siteTitle: string; urls: PageActionsDropdownURLs; markdownIsDefault: boolean }
): React.ReactNode {
    const { siteTitle, urls, markdownIsDefault } = params;

    switch (type) {
        case 'external-ai':
            return (
                <React.Fragment key="external-ai">
                    <DropdownMenuSeparator className="first:hidden" />
                    <ActionOpenInLLM provider="chatgpt" url={urls.html} type="dropdown-menu-item" />
                    <ActionOpenInLLM provider="claude" url={urls.html} type="dropdown-menu-item" />
                </React.Fragment>
            );
        case 'markdown':
            return (
                <React.Fragment key="markdown">
                    <DropdownMenuSeparator className="first:hidden" />
                    <ActionCopyMarkdown
                        isDefaultAction={markdownIsDefault}
                        markdownPageURL={urls.markdown}
                        type="dropdown-menu-item"
                    />
                    <ActionViewAsMarkdown
                        markdownPageURL={urls.markdown}
                        type="dropdown-menu-item"
                    />
                </React.Fragment>
            );
        case 'mcp':
            if (!urls.mcp) {
                return null;
            }
            return (
                <React.Fragment key="mcp">
                    <DropdownMenuSeparator className="first:hidden" />
                    <ActionCopyMCPURL mcpURL={urls.mcp} type="dropdown-menu-item" />
                    <ActionOpenMCP
                        provider="vscode"
                        mcpURL={urls.mcp}
                        siteTitle={siteTitle}
                        type="dropdown-menu-item"
                    />
                    <ActionCopyMCPCommand
                        provider="claude-code"
                        mcpURL={urls.mcp}
                        siteTitle={siteTitle}
                        type="dropdown-menu-item"
                    />
                    <ActionCopyMCPCommand
                        provider="codex"
                        mcpURL={urls.mcp}
                        siteTitle={siteTitle}
                        type="dropdown-menu-item"
                    />
                </React.Fragment>
            );
        case 'git':
            if (!urls.editOnGit) {
                return null;
            }
            return (
                <React.Fragment key="git">
                    <DropdownMenuSeparator className="first:hidden" />
                    <ActionOpenEditOnGit
                        type="dropdown-menu-item"
                        provider={urls.editOnGit.provider}
                        url={urls.editOnGit.url}
                    />
                </React.Fragment>
            );
        case 'pdf':
            if (!urls.pdf) {
                return null;
            }
            return (
                <React.Fragment key="pdf">
                    <DropdownMenuSeparator className="first:hidden" />
                    <ActionViewAsPDF url={urls.pdf} type="dropdown-menu-item" />
                </React.Fragment>
            );
        default:
            return null;
    }
}

/**
 * Render the action shown as the quick-access default button for a given action type.
 */
function renderDefaultActionForType(
    type: CustomizationPageActionType,
    params: { siteTitle: string; urls: PageActionsDropdownURLs }
): React.ReactNode {
    const { urls } = params;

    switch (type) {
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
