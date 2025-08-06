'use client';

import {
    CopyMarkdown,
    OpenDocsAssistant,
    OpenInLLM,
    ViewAsMarkdown,
} from '@/components/AIActions/AIActions';
import { Button, ButtonGroup } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuSeparator } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import type { SiteCustomizationSettings } from '@gitbook/api';

import { Icon } from '@gitbook/icons';
import { useRef } from 'react';

interface AIActionsDropdownProps {
    markdownPageUrl: string;
    withAIChat?: boolean;
    trademark: boolean;
    actions: SiteCustomizationSettings['pageActions'];
}

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function AIActionsDropdown(props: AIActionsDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);
    const language = useLanguage();

    return (
        <ButtonGroup ref={ref}>
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
                    <AIActionsDropdownMenuContent {...props} />
                </DropdownMenu>
            ) : null}
        </ButtonGroup>
    );
}

/**
 * The content of the dropdown menu.
 */
function AIActionsDropdownMenuContent(props: AIActionsDropdownProps) {
    const { markdownPageUrl, withAIChat, trademark, actions } = props;

    return (
        <>
            {withAIChat ? (
                <OpenDocsAssistant trademark={trademark} type="dropdown-menu-item" />
            ) : null}

            {actions.markdown ? (
                <>
                    <DropdownMenuSeparator className="first:hidden" />
                    <CopyMarkdown
                        isDefaultAction={!withAIChat}
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
function DefaultAction(props: AIActionsDropdownProps) {
    const { markdownPageUrl, withAIChat, trademark, actions } = props;

    if (withAIChat) {
        return <OpenDocsAssistant trademark={trademark} type="button" />;
    }

    if (actions.markdown) {
        return (
            <CopyMarkdown
                isDefaultAction={!withAIChat}
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
