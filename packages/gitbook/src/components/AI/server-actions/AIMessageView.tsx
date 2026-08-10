import { CollapsibleContent } from '@/components/primitives';
import type { GitBookSiteContext } from '@/lib/context';
import { tcls } from '@/lib/tailwind';
import { type AIMessage, AIMessageStepPhase } from '@gitbook/api';
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

    return message.steps.length > 0 ? (
        <div className="flex flex-col space-y-2">
            {message.steps.map((step, index) => {
                const hasContent = Boolean(step.content && step.content.nodes.length > 0);
                const Tag =
                    step.phase === AIMessageStepPhase.Commentary ? CollapsibleContent : 'div';
                return (
                    <Tag
                        key={index}
                        className={tcls(
                            'flex flex-col space-y-2 border-tint-subtle',
                            hasContent ? 'has-content' : ''
                        )}
                    >
                        {step.content ? (
                            <DocumentView
                                document={step.content}
                                context={{
                                    mode: 'default',
                                    contentContext: context,
                                    wrapBlocksInSuspense: false,
                                    withLinkPreviews,
                                }}
                                style={tcls(
                                    'ai-response-document mt-2 space-y-4 *:origin-top-left *:animate-blur-in-slow empty:hidden',
                                    step.phase === AIMessageStepPhase.Commentary
                                        ? 'text-tint group-data-[disabled]/collapsible:text-inherit'
                                        : ''
                                )}
                            />
                        ) : null}

                        {withToolCalls && step.toolCalls && step.toolCalls.length > 0 ? (
                            <AIToolCallsSummary toolCalls={step.toolCalls} context={context} />
                        ) : null}
                    </Tag>
                );
            })}
        </div>
    ) : null;
}
