'use client';

import {
    CopyMarkdown,
    GitEditLink,
    OpenAIAssistant,
    OpenInLLM,
    ViewAsMarkdown,
    ViewAsPDF,
} from '@/components/PageActions/PageActions';
import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { GitSyncState, SiteCustomizationSettings } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { useRef } from 'react';
import { useAI } from '../AI';

interface PageActionsDropdownProps {
    markdownPageUrl: string;
    className?: string;
    actions: SiteCustomizationSettings['pageActions'];
    editOnGit?: {
        provider: GitSyncState['installationProvider'];
        url: string;
    };
    pdfUrl?: string;
}

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function PageActionsDropdown(props: PageActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );
    const language = useLanguage();

    const defaultActions = [assistants.length > 0, props.actions.markdown, props.editOnGit].filter(
        Boolean
    );
    const dropdownActions = [props.actions.externalAI, props.pdfUrl].filter(Boolean);

    return [...defaultActions, ...dropdownActions].length > 0 ? (
        <ButtonGroup ref={ref} className={props.className}>
            {defaultActions.length > 0 ? <DefaultAction {...props} /> : null}
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
                            label={tString(
                                language,
                                defaultActions.some(Boolean) ? 'more' : 'actions'
                            )}
                            iconOnly={defaultActions.some(Boolean)}
                            size="xsmall"
                            variant="secondary"
                            className="bg-tint-base text-sm"
                        />
                    }
                >
                    <PageActionsDropdownMenuContent {...props} />
                </DropdownMenu>
            ) : null}
        </ButtonGroup>
    ) : null;
}

/**
 * The content of the dropdown menu.
 */
function PageActionsDropdownMenuContent(props: PageActionsDropdownProps) {
    const { markdownPageUrl, actions } = props;
    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );

    return (
        <>
            {assistants.map((assistant) => (
                <OpenAIAssistant
                    key={assistant.label}
                    assistant={assistant}
                    type="dropdown-menu-item"
                />
            ))}

            {actions.markdown ? (
                <>
                    <DropdownMenuSeparator className="first:hidden" />
                    <CopyMarkdown
                        isDefaultAction={!assistants.length}
                        markdownPageUrl={markdownPageUrl}
                        type="dropdown-menu-item"
                    />
                    <ViewAsMarkdown markdownPageUrl={markdownPageUrl} type="dropdown-menu-item" />
                </>
            ) : null}

            {actions.externalAI ? (
                <>
                    <DropdownMenuSeparator className="first:hidden" />
                    <OpenInLLM provider="chatgpt" url={markdownPageUrl} type="dropdown-menu-item" />
                    <OpenInLLM provider="claude" url={markdownPageUrl} type="dropdown-menu-item" />
                </>
            ) : null}

            {props.editOnGit || props.pdfUrl ? (
                <>
                    <DropdownMenuSeparator className="first:hidden" />
                    {props.editOnGit ? (
                        <GitEditLink
                            type="dropdown-menu-item"
                            provider={props.editOnGit.provider}
                            url={props.editOnGit.url}
                        />
                    ) : null}
                    {props.pdfUrl ? (
                        <ViewAsPDF url={props.pdfUrl} type="dropdown-menu-item" />
                    ) : null}
                </>
            ) : null}
        </>
    );
}

/**
 * A default action shown as a quick-access button beside the dropdown menu
 */
function DefaultAction(props: PageActionsDropdownProps) {
    const { markdownPageUrl, actions } = props;
    const assistants = useAI().assistants.filter(
        (assistant) => assistant.ui === true && assistant.pageAction
    );

    const assistant = assistants[0];
    if (assistant) {
        return <OpenAIAssistant assistant={assistant} type="button" />;
    }

    if (props.editOnGit) {
        return (
            <GitEditLink
                type="button"
                provider={props.editOnGit.provider}
                url={props.editOnGit.url}
            />
        );
    }

    if (actions.markdown) {
        return (
            <CopyMarkdown
                isDefaultAction={!assistant}
                markdownPageUrl={markdownPageUrl}
                type="button"
            />
        );
    }
}
