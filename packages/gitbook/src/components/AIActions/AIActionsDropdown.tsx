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

export function AIActionsDropdown(props: {
    markdown?: string;
    markdownPageUrl: string;
    /**
     * Whether to include the "Ask Docs Assistant" entry in the dropdown menu. This **does not**
     * affect the standalone assistant button rendered next to the dropdown.
     * Defaults to `false` to avoid duplicating the action unless explicitly requested.
     */
    withAIChat?: boolean;
    pageURL: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="hidden h-fit items-stretch justify-start md:flex">
            <DefaultAction {...props} />
            <DropdownMenu
                align="end"
                className="!min-w-60"
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
                <DropdownMenuContent {...props} />
            </DropdownMenu>
        </div>
    );
}

function DropdownMenuContent(props: {
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
                    <CopyMarkdown markdown={markdown} type="dropdown-menu-item" />
                    <ViewAsMarkdown markdownPageUrl={markdownPageUrl} type="dropdown-menu-item" />
                </>
            ) : null}
            <OpenInLLM provider="chatgpt" url={pageURL} type="dropdown-menu-item" />
            <OpenInLLM provider="claude" url={pageURL} type="dropdown-menu-item" />
        </>
    );
}

function DefaultAction(props: {
    markdown?: string;
    withAIChat?: boolean;
    pageURL: string;
}) {
    const { markdown, withAIChat, pageURL } = props;

    if (withAIChat) {
        return <OpenDocsAssistant type="button" />;
    }
    if (markdown) {
        return <CopyMarkdown markdown={markdown} type="button" />;
    }

    return <OpenInLLM provider="chatgpt" url={pageURL} type="button" />;
}
