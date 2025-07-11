'use client';

import {
    CopyMarkdown,
    OpenDocsAssistant,
    OpenInLLM,
    ViewAsMarkdown,
} from '@/components/AIActions/AIActions';
import { Button } from '@/components/primitives/Button';
import { DropdownMenu } from '@/components/primitives/DropdownMenu';

import { Icon } from '@gitbook/icons';
import { useRef } from 'react';

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function AIActionsDropdown(props: {
    markdownPageUrl: string;
    /**
     * Whether to include the "Ask Docs Assistant" entry in the dropdown menu.
     */
    withAIChat?: boolean;
    pageURL: string;
    trademark: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="flex h-fit items-stretch justify-start">
            <DefaultAction {...props} />
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
                        iconOnly
                        size="xsmall"
                        variant="secondary"
                        className="hover:!scale-100 !shadow-none !rounded-l-none bg-tint-base text-sm"
                    />
                }
            >
                <AIActionsDropdownMenuContent {...props} />
            </DropdownMenu>
        </div>
    );
}

/**
 * The content of the dropdown menu.
 */
function AIActionsDropdownMenuContent(props: {
    markdownPageUrl: string;
    withAIChat?: boolean;
    pageURL: string;
    trademark: boolean;
}) {
    const { markdownPageUrl, withAIChat, pageURL, trademark } = props;

    return (
        <>
            {withAIChat ? (
                <OpenDocsAssistant trademark={trademark} type="dropdown-menu-item" />
            ) : null}

            <CopyMarkdown
                isDefaultAction={!withAIChat}
                markdownPageUrl={markdownPageUrl}
                type="dropdown-menu-item"
            />
            <ViewAsMarkdown markdownPageUrl={markdownPageUrl} type="dropdown-menu-item" />

            <OpenInLLM provider="chatgpt" url={pageURL} type="dropdown-menu-item" />
            <OpenInLLM provider="claude" url={pageURL} type="dropdown-menu-item" />
        </>
    );
}

/**
 * A default action shown as a quick-access button beside the dropdown menu
 */
function DefaultAction(props: {
    markdownPageUrl: string;
    withAIChat?: boolean;
    trademark: boolean;
}) {
    const { markdownPageUrl, withAIChat, trademark } = props;

    if (withAIChat) {
        return <OpenDocsAssistant trademark={trademark} type="button" />;
    }

    return (
        <CopyMarkdown
            isDefaultAction={!withAIChat}
            markdownPageUrl={markdownPageUrl}
            type="button"
        />
    );
}
