import { Link } from '@/components/primitives';
import { resolveContentRef } from '@/lib/references';
import type { AIToolCall, ContentRef } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import type { GitBookSiteContext } from '@v2/lib/context';
import type * as React from 'react';

/**
 * Display the tool calls in a message or step.
 */
export function AIToolCallsSummary(props: {
    toolCalls: AIToolCall[];
    context: GitBookSiteContext;
}) {
    const { toolCalls, context } = props;

    return (
        <div className="flex flex-col gap-1">
            {toolCalls.map((toolCall, index) => (
                <ToolCallSummary key={index} toolCall={toolCall} context={context} />
            ))}
        </div>
    );
}

function ToolCallSummary(props: {
    toolCall: AIToolCall;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    return (
        <p className="text-slate-700 text-sm">
            <Icon
                icon={getIconForToolCall(toolCall)}
                className="mr-1 inline-block size-3 text-slate-300"
            />
            {getDescriptionForToolCall(toolCall, context)}
        </p>
    );
}

function getDescriptionForToolCall(
    toolCall: AIToolCall,
    context: GitBookSiteContext
): React.ReactNode {
    switch (toolCall.tool) {
        case 'getPageContent':
            return (
                <>
                    Read page{' '}
                    <ContentRefLink
                        contentRef={{
                            kind: 'page',
                            page: toolCall.page.id,
                            space: toolCall.spaceId,
                        }}
                        context={context}
                        fallback={toolCall.page.title}
                    />
                    <OtherSpaceLink spaceId={toolCall.spaceId} context={context} />
                </>
            );
        case 'search':
            // TODO: Show in a popover the results using the list `toolCall.results`.
            return (
                <>
                    Searched <strong>{toolCall.query}</strong>
                </>
            );
        case 'getPages':
            return (
                <>
                    Listed the pages
                    <OtherSpaceLink spaceId={toolCall.spaceId} context={context} />
                </>
            );
        default:
            return <>{toolCall.tool}</>;
    }
}

function getIconForToolCall(toolCall: AIToolCall): IconName {
    switch (toolCall.tool) {
        case 'getPageContent':
            return 'memo';
        case 'search':
            return 'magnifying-glass';
        case 'getPages':
            return 'files';
        default:
            return 'hammer';
    }
}

/**
 * Link to a space that is not the current space.
 */
function OtherSpaceLink(props: {
    spaceId: string;
    context: GitBookSiteContext;
    prefix?: React.ReactNode;
}) {
    const { spaceId, prefix = ' in ', context } = props;

    if (context.space.id === spaceId) {
        return null;
    }

    return (
        <>
            {prefix}
            <ContentRefLink
                contentRef={{
                    kind: 'space',
                    space: spaceId,
                }}
                context={context}
            />
        </>
    );
}

async function ContentRefLink(props: {
    contentRef: ContentRef;
    context: GitBookSiteContext;
    fallback?: React.ReactNode;
}) {
    const { contentRef, context, fallback } = props;

    const resolved = await resolveContentRef(contentRef, context);

    if (!resolved) {
        return <span>{fallback}</span>;
    }

    return (
        <Link href={resolved.href} className="text-inherit underline decoration-dashed">
            {resolved.text}
        </Link>
    );
}
