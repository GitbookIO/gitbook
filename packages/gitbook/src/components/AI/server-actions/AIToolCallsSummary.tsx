import { HighlightQuery } from '@/components/Search/HighlightQuery';
import { Link, StyledLink } from '@/components/primitives';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
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
    const language = getSpaceLanguage(context.customization);
    switch (toolCall.tool) {
        case 'getPageContent':
            return (
                <p>
                    {t(
                        language,
                        'ai_chat_tools_read_page',
                        <>
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
                    )}
                </p>
            );
        case 'search': {
            // Resolve all hrefs for search results in parallel
            const searchResultsWithHrefs = await Promise.all(
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
            );

            return (
                <details className="-ml-5 group flex w-full flex-col gap-2">
                    <summary className="-mx-2 -mt-2 flex cursor-pointer list-none items-center gap-2 rounded-corners:rounded-md py-2 pr-4 pl-7 transition-colors marker:hidden hover:bg-primary-hover">
                        <div className="flex flex-col">
                            <p>{t(language, 'searched_for', <strong>{toolCall.query}</strong>)}</p>
                            <p className="text-tint-subtle text-xs">
                                {toolCall.results.length
                                    ? t(language, 'search_results_count', toolCall.results.length)
                                    : t(language, 'search_no_results')}
                            </p>
                        </div>
                        <Icon
                            icon="chevron-right"
                            className="ml-auto size-3 shrink-0 transition-transform group-open:rotate-90"
                        />
                    </summary>
                    <div className="max-h-0 overflow-y-auto circular-corners:rounded-2xl rounded-corners:rounded-lg border border-tint-subtle p-2 opacity-0 transition-all group-open:max-h-96 group-open:opacity-11">
                        <ol className="space-y-1">
                            {searchResultsWithHrefs.map((result, index) => (
                                <li
                                    key={result.pageId}
                                    className="animate-fadeIn"
                                    style={{
                                        animationDelay: `${index * 25}ms`,
                                    }}
                                >
                                    <Link
                                        href={result.href}
                                        key={result.pageId}
                                        className="flex items-start gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md px-3 py-2 transition-colors hover:bg-primary-hover"
                                    >
                                        <Icon
                                            icon="memo"
                                            className="mt-1 size-3 shrink-0 text-tint-subtle"
                                        />
                                        <div className="flex flex-col gap-1 text-tint">
                                            <h3 className="line-clamp-2 font-medium text-sm text-tint">
                                                <HighlightQuery
                                                    query={toolCall.query}
                                                    text={result.title}
                                                />
                                            </h3>
                                            {result.description && (
                                                <p className="line-clamp-2 text-tint-subtle text-xs">
                                                    <HighlightQuery
                                                        query={toolCall.query}
                                                        text={result.description}
                                                    />
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>
                </details>
            );
        }
        case 'getPages':
            return (
                <p>
                    {t(language, 'ai_chat_tools_listed_pages')}
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
