import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import type { GitBookSiteContext } from '@/lib/context';
import { tcls } from '@/lib/tailwind';
import type { AIMessage } from '@gitbook/api';
import { DocumentView } from '../../DocumentView';
import { AIToolCallsSummary } from './AIToolCallsSummary';
import type { RenderAIMessageOptions } from './types';

/**
 * Render a message from the API backend.
 */
export function AIMessageView(
    props: RenderAIMessageOptions & {
        message: AIMessage;
        context: GitBookSiteContext;
    }
) {
    const { message, context, withToolCalls = true, withLinkPreviews = true } = props;
    const language = getSpaceLanguage(context);

    return message.steps.length > 0 ? (
        <div className="flex flex-col gap-2">
            {message.steps.map((step, index) => {
                const hasContent = Boolean(step.content && step.content.nodes.length > 0);
                const hasReasoning = Boolean(step.reasoning && step.reasoning.nodes.length > 0);
                return (
                    <div
                        key={index}
                        className={tcls('flex flex-col gap-2', hasContent ? 'has-content' : '')}
                    >
                        {hasReasoning ? (
                            hasContent ? (
                                <details className="group/commentary flex flex-col gap-2">
                                    <summary className="-mx-2 flex cursor-pointer list-none items-center gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md px-2 py-1 text-tint-subtle text-xs transition-colors marker:hidden hover:bg-primary-hover">
                                        <span>{t(language, 'ai_chat_commentary')}</span>
                                        <span className="ml-auto flex items-center gap-1">
                                            <span className="block group-open/commentary:hidden">
                                                {t(language, 'view')}
                                            </span>
                                            <span className="hidden group-open/commentary:block">
                                                {t(language, 'close')}
                                            </span>
                                        </span>
                                    </summary>
                                    <DocumentView
                                        document={step.reasoning}
                                        context={{
                                            mode: 'default',
                                            contentContext: context,
                                            wrapBlocksInSuspense: false,
                                            withLinkPreviews,
                                        }}
                                        style="ai-response-document space-y-4 text-tint *:origin-top-left *:animate-blur-in-slow empty:hidden"
                                    />
                                </details>
                            ) : (
                                <DocumentView
                                    document={step.reasoning}
                                    context={{
                                        mode: 'default',
                                        contentContext: context,
                                        wrapBlocksInSuspense: false,
                                        withLinkPreviews,
                                    }}
                                    style="ai-response-document space-y-4 text-tint *:origin-top-left *:animate-blur-in-slow empty:hidden"
                                />
                            )
                        ) : null}

                        {withToolCalls && step.toolCalls && step.toolCalls.length > 0 ? (
                            <AIToolCallsSummary toolCalls={step.toolCalls} context={context} />
                        ) : null}

                        {step.content ? (
                            <DocumentView
                                document={step.content}
                                context={{
                                    mode: 'default',
                                    contentContext: context,
                                    wrapBlocksInSuspense: false,
                                    withLinkPreviews,
                                }}
                                style="ai-response-document mt-2 space-y-4 *:origin-top-left *:animate-blur-in-slow empty:hidden"
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
    ) : null;
}
