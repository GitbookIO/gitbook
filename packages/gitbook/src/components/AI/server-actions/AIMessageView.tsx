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

    return (
        <div className="flex flex-col gap-2">
            {message.steps.map((step, index) => {
                return (
                    <div
                        key={index}
                        className={tcls(
                            'flex animate-fade-in-slow flex-col gap-2',
                            step.content.nodes.length > 0 ? 'has-content' : ''
                        )}
                    >
                        <DocumentView
                            document={step.content}
                            context={{
                                mode: 'default',
                                contentContext: context,
                                wrapBlocksInSuspense: false,
                                withLinkPreviews,
                            }}
                            style="mt-2 space-y-4 empty:hidden"
                        />

                        {withToolCalls && step.toolCalls && step.toolCalls.length > 0 ? (
                            <AIToolCallsSummary toolCalls={step.toolCalls} context={context} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
