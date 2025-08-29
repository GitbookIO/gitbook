import { HighlightQuery } from '@/components/Search/HighlightQuery';
import { Link, StyledLink } from '@/components/primitives';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import type { GitBookSiteContext } from '@/lib/context';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import type {
    AIToolCall,
    AIToolCallGetPageContent,
    AIToolCallGetPages,
    AIToolCallMCP,
    AIToolCallOther,
    AIToolCallSearch,
    ContentRef,
} from '@gitbook/api';
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

function ToolCallSummary(props: { toolCall: AIToolCall; context: GitBookSiteContext }) {
    const { toolCall, context } = props;

    return (
        <div className="flex origin-left animate-scale-in-slow items-start gap-2 text-sm text-tint-subtle">
            <Icon
                icon={getIconForToolCall(toolCall)}
                className="mt-1 size-3 shrink-0 text-tint-subtle/8"
            />
            {getDescriptionForToolCall(toolCall, context)}
        </div>
    );
}

function getDescriptionForToolCall(toolCall: AIToolCall, context: GitBookSiteContext) {
    switch (toolCall.tool) {
        case 'getPageContent':
            return <DescriptionForPageContentToolCall toolCall={toolCall} context={context} />;
        case 'search':
            return <DescriptionForSearchToolCall toolCall={toolCall} context={context} />;
        case 'getPages':
            return <DescriptionForGetPagesToolCall toolCall={toolCall} context={context} />;
        case 'mcp':
            return <DescriptionForMCPToolCall toolCall={toolCall} context={context} />;
        case 'other':
            return <DescriptionForOtherToolCall toolCall={toolCall} context={context} />;
        default:
            return <>{toolCall.tool}</>;
    }
}

function DescriptionForPageContentToolCall(props: {
    toolCall: AIToolCallGetPageContent;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    const language = getSpaceLanguage(context);

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
}

function DescriptionForMCPToolCall(props: {
    toolCall: AIToolCallMCP;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    const language = getSpaceLanguage(context);

    return (
        <p>
            {t(
                language,
                'ai_chat_tools_mcp_tool',
                <strong>{toolCall.mcpToolTitle ?? toolCall.mcpToolName}</strong>
            )}
        </p>
    );
}

function DescriptionForOtherToolCall(props: {
    toolCall: AIToolCallOther;
    context: GitBookSiteContext;
}) {
    const { toolCall } = props;

    return <p>{toolCall.summary.text}</p>;
}

async function DescriptionForSearchToolCall(props: {
    toolCall: AIToolCallSearch;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    const language = getSpaceLanguage(context);

    // Resolve all hrefs for search results in parallel
    const searchResultsWithHrefs = await Promise.all(
        toolCall.results.map(async (result) => {
            const resolved = await resolveContentRef(
                result.anchor
                    ? {
                          kind: 'anchor',
                          page: result.pageId,
                          space: result.spaceId,
                          anchor: result.anchor,
                      }
                    : {
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

    const hasResults = toolCall.results.length > 0;

    return (
        <details className={tcls('-ml-5 group flex w-full flex-col', hasResults ? 'gap-2' : '')}>
            <summary
                className={tcls(
                    '-mx-2 flex list-none items-center gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md pr-4 pl-7 transition-colors marker:hidden',
                    hasResults ? '-my-2 cursor-pointer py-2 hover:bg-primary-hover' : ''
                )}
            >
                <div className="flex min-w-0 flex-col break-words leading-snug">
                    <p>{t(language, 'searched_for', <strong>{toolCall.query}</strong>)}</p>
                    <p className="mt-0.5 text-tint-subtle text-xs">
                        {hasResults
                            ? t(language, 'search_results_count', toolCall.results.length)
                            : t(language, 'search_no_results')}
                    </p>
                </div>
                {hasResults ? (
                    <div className="ml-auto flex items-center gap-1">
                        <span className="block group-open:hidden">{t(language, 'view')}</span>
                        <span className="hidden group-open:block">{t(language, 'close')}</span>
                        <Icon
                            icon="chevron-right"
                            className="size-3 shrink-0 transition-transform group-open:rotate-90"
                        />
                    </div>
                ) : null}
            </summary>
            {hasResults ? (
                <div className="hide-scrollbar mt-1 max-h-0 overflow-y-auto circular-corners:rounded-2xl rounded-corners:rounded-lg border border-tint-subtle p-2 opacity-0 transition-all transition-discrete duration-500 group-open:max-h-96 group-open:opacity-11">
                    <ol className="space-y-1">
                        {searchResultsWithHrefs.map((result, index) => (
                            <li
                                key={`${result.pageId}-${index}`}
                                className="animate-fade-in-slow"
                                style={{
                                    animationDelay: `${index * 25}ms`,
                                }}
                            >
                                <Link
                                    href={result.href}
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
                                    <Icon
                                        icon="chevron-right"
                                        className="ml-auto size-3 shrink-0 self-center"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            ) : null}
        </details>
    );
}

function DescriptionForGetPagesToolCall(props: {
    toolCall: AIToolCallGetPages;
    context: GitBookSiteContext;
}) {
    const { toolCall, context } = props;

    const language = getSpaceLanguage(context);

    return (
        <p>
            {t(language, 'ai_chat_tools_listed_pages')}
            <OtherSpaceLink spaceId={toolCall.spaceId} context={context} />
        </p>
    );
}

function getIconForToolCall(toolCall: AIToolCall): IconName {
    switch (toolCall.tool) {
        case 'getPageContent':
            return 'memo';
        case 'search':
            return 'magnifying-glass';
        case 'getPages':
            return 'files';
        case 'other':
            return (toolCall.summary.icon as IconName) ?? 'hammer';
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
