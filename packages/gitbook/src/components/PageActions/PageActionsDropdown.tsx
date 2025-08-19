'use client';

import {
    CopyMarkdown,
    OpenAIAssistant,
    OpenInLLM,
    ViewAsMarkdown,
} from '@/components/PageActions/PageActions';
import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { SiteCustomizationSettings } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { useRef } from 'react';
import { useAI } from '../AI';

interface PageActionsDropdownProps {
    markdownPageUrl: string;
    className?: string;
    actions: SiteCustomizationSettings['pageActions'];
}

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function PageActionsDropdown(props: PageActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const assistants = useAI().assistants.filter((assistant) => assistant.ui === true);
    const language = useLanguage();

    return assistants.length > 0 || props.actions.markdown || props.actions.externalAI ? (
        <ButtonGroup ref={ref} className={props.className}>
            <DefaultAction {...props} />
            {props.actions.markdown || props.actions.externalAI ? (
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
                            label={tString(language, 'more')}
                            iconOnly
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
    const assistants = useAI().assistants.filter((assistant) => assistant.ui === true);

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
        </>
    );
}

/**
 * A default action shown as a quick-access button beside the dropdown menu
 */
function DefaultAction(props: PageActionsDropdownProps) {
    const { markdownPageUrl, actions } = props;
    const assistants = useAI().assistants.filter((assistant) => assistant.ui === true);

    if (assistants.length) {
        return <OpenAIAssistant assistant={assistants[0]} type="button" />;
    }

    if (actions.markdown) {
        return (
            <CopyMarkdown
                isDefaultAction={!assistants.length}
                markdownPageUrl={markdownPageUrl}
                type="button"
            />
        );
    }

    if (actions.externalAI) {
        return (
            <>
                <OpenInLLM provider="chatgpt" url={markdownPageUrl} type="button" />
            </>
        );
    }
}
