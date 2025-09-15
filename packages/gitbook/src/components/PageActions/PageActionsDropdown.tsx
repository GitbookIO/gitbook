'use client';

import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { GitSyncState, SiteCustomizationSettings } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React, { useRef } from 'react';
import { useAI } from '../AI';
import {
    ActionCopyMCPURL,
    ActionCopyMarkdown,
    ActionOpenAssistant,
    ActionOpenEditOnGit,
    ActionOpenInLLM,
    ActionOpenMCP,
    ActionViewAsMarkdown,
    ActionViewAsPDF,
} from './PageActions';

interface PageActionsDropdownProps {
    siteTitle: string;
    markdownPageURL: string;
    mcpURL?: string;
    pdfURL?: string;
    className?: string;
    actions: SiteCustomizationSettings['pageActions'];
    editOnGit?: {
        provider: GitSyncState['installationProvider'];
        url: string;
    };
}

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function PageActionsDropdown(props: PageActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const language = useLanguage();

    const defaultAction = getPageDefaultAction(props);
    const dropdownActions = getPageDropdownActions(props);

    return defaultAction || dropdownActions.length > 0 ? (
        <ButtonGroup ref={ref} className={props.className}>
            {defaultAction}
            {dropdownActions.length > 0 ? (
                <DropdownMenu
                    align="end"
                    className="!min-w-60 max-w-max"
                    button={
                        <Button
                            icon={
                                <Icon
                                    icon="chevron-down"
                                    className="size-3 transition-transform group-data-[state=open]/button:rotate-180"
                                />
                            }
                            label={tString(language, defaultAction ? 'more' : 'actions')}
                            iconOnly={!!defaultAction}
                            size="xsmall"
                            variant="secondary"
                            className="bg-tint-base text-sm"
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
 * Return the list of actions to show in the dropdown menu.
 */
function getPageDropdownActions(props: PageActionsDropdownProps): React.ReactNode[] {
    const { siteTitle, markdownPageURL, mcpURL, actions } = props;
    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );

    return [
        ...assistants.map((assistant) => (
            <ActionOpenAssistant
                key={assistant.label}
                assistant={assistant}
                type="dropdown-menu-item"
            />
        )),

        actions.markdown ? (
            <React.Fragment key="markdown">
                <DropdownMenuSeparator className="first:hidden" />
                <ActionCopyMarkdown
                    isDefaultAction={!assistants.length}
                    markdownPageURL={markdownPageURL}
                    type="dropdown-menu-item"
                />
                <ActionViewAsMarkdown markdownPageURL={markdownPageURL} type="dropdown-menu-item" />
            </React.Fragment>
        ) : null,

        actions.externalAI ? (
            <React.Fragment key="externalAI">
                <DropdownMenuSeparator className="first:hidden" />
                <ActionOpenInLLM
                    provider="chatgpt"
                    url={markdownPageURL}
                    type="dropdown-menu-item"
                />
                <ActionOpenInLLM
                    provider="claude"
                    url={markdownPageURL}
                    type="dropdown-menu-item"
                />
            </React.Fragment>
        ) : null,

        actions.mcp && mcpURL ? (
            <React.Fragment key="mcp">
                <DropdownMenuSeparator className="first:hidden" />
                <ActionCopyMCPURL mcpURL={mcpURL} type="dropdown-menu-item" />
                <ActionOpenMCP
                    provider="vscode"
                    mcpURL={mcpURL}
                    siteTitle={siteTitle}
                    type="dropdown-menu-item"
                />
            </React.Fragment>
        ) : null,

        props.editOnGit || props.pdfURL ? (
            <React.Fragment key="editOnGit">
                <DropdownMenuSeparator className="first:hidden" />
                {props.editOnGit ? (
                    <ActionOpenEditOnGit
                        type="dropdown-menu-item"
                        provider={props.editOnGit.provider}
                        url={props.editOnGit.url}
                    />
                ) : null}
                {props.pdfURL ? (
                    <ActionViewAsPDF url={props.pdfURL} type="dropdown-menu-item" />
                ) : null}
            </React.Fragment>
        ) : null,
    ].filter(Boolean);
}

/**
 * A default action shown as a quick-access button beside the dropdown menu
 */
function getPageDefaultAction(props: PageActionsDropdownProps) {
    const { markdownPageURL, actions } = props;
    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );

    const assistant = assistants[0];
    if (assistant) {
        return <ActionOpenAssistant assistant={assistant} type="button" />;
    }

    if (props.editOnGit) {
        return (
            <ActionOpenEditOnGit
                type="button"
                provider={props.editOnGit.provider}
                url={props.editOnGit.url}
            />
        );
    }

    if (actions.markdown) {
        return (
            <ActionCopyMarkdown
                isDefaultAction={!assistant}
                markdownPageURL={markdownPageURL}
                type="button"
            />
        );
    }

    return null;
}
