import { AISearchResults } from '@/components/AIChat/AISearchResults';
import { StyledLink } from '@/components/primitives';
import type { GitBookSiteContext } from '@/lib/context';
import { resolveContentRef } from '@/lib/references';
import type { AIToolCall, ContentRef } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
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

async function ToolCallSummary(props: {
    toolCall: AIToolCall;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    return (
        <div className="flex items-start gap-2 text-sm text-tint">
            <Icon
                icon={getIconForToolCall(toolCall)}
                className="mt-1 size-3 shrink-0 text-tint-subtle/8"
            />
            {await getDescriptionForToolCall(toolCall, context)}
        </div>
    );
}

async function getDescriptionForToolCall(
    toolCall: AIToolCall,
    context: GitBookSiteContext
): Promise<React.ReactNode> {
    switch (toolCall.tool) {
        case 'getPageContent':
            return (
                <p>
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
                </p>
            );
        case 'search':
            return (
                <AISearchResults
                    query={toolCall.query}
                    results={
                        await Promise.all(
                            toolCall.results.map(async (result) => {
                                const resolved = await resolveContentRef(
                                    {
                                        kind: 'page',
                                        page: result.pageId,
                                        space: result.spaceId,
                                    },
                                    context
                                );

                                return {
                                    ...result,
                                    href: resolved?.href || '#',
                                };
                            })
                        )
                    }
                />
            );
        case 'getPages':
            return (
                <p>
                    Listed the pages
                    <OtherSpaceLink spaceId={toolCall.spaceId} context={context} />
                </p>
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

    return <StyledLink href={resolved.href}>{resolved.text}</StyledLink>;
}
