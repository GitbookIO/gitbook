'use client';

import {
    CopyMarkdown,
    OpenDocsAssistant,
    OpenInLLM,
    ViewAsMarkdown,
} from '@/components/AIActions/AIActions';
import { Button } from '@/components/primitives/Button';
import { DropdownMenu } from '@/components/primitives/DropdownMenu';
import { useRef } from 'react';

/**
 * Dropdown menu for the AI Actions (Ask Docs Assistant, Copy page, View as Markdown, Open in LLM).
 */
export function AIActionsDropdown(props: {
    markdown?: string;
    markdownPageUrl: string;
    /**
     * Whether to include the "Ask Docs Assistant" entry in the dropdown menu.
     */
    withAIChat?: boolean;
    pageURL: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="hidden h-fit items-stretch justify-start sm:flex">
            <DefaultAction {...props} />
            <DropdownMenu
                align="end"
                className="!min-w-60 max-w-max"
                button={
                    <Button
                        icon="chevron-down"
                        iconOnly
                        size="small"
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
    markdown?: string;
    markdownPageUrl: string;
    withAIChat?: boolean;
    pageURL: string;
}) {
    const { markdown, markdownPageUrl, withAIChat, pageURL } = props;

    return (
        <>
            {withAIChat ? <OpenDocsAssistant type="dropdown-menu-item" /> : null}
            {markdown ? (
                <>
                    <CopyMarkdown
                        markdown={markdown}
                        isDefaultAction={!withAIChat}
                        type="dropdown-menu-item"
                    />
                    <ViewAsMarkdown markdownPageUrl={markdownPageUrl} type="dropdown-menu-item" />
                </>
            ) : null}
            <OpenInLLM provider="chatgpt" url={pageURL} type="dropdown-menu-item" />
            <OpenInLLM provider="claude" url={pageURL} type="dropdown-menu-item" />
        </>
    );
}

/**
 * A default action shown as a quick-access button beside the dropdown menu
 */
function DefaultAction(props: {
    markdown?: string;
    withAIChat?: boolean;
    pageURL: string;
    markdownPageUrl: string;
}) {
    const { markdown, withAIChat, pageURL, markdownPageUrl } = props;

    if (withAIChat) {
        return <OpenDocsAssistant type="button" />;
    }

    if (markdown) {
        return <CopyMarkdown isDefaultAction={!withAIChat} markdown={markdown} type="button" />;
    }

    if (markdownPageUrl) {
        return <ViewAsMarkdown markdownPageUrl={markdownPageUrl} type="button" />;
    }

    return <OpenInLLM provider="chatgpt" url={pageURL} type="button" />;
}
