import type { GitBookSiteContext } from '@/lib/context';
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
    const { message, context, renderToolCalls = true } = props;

    return (
        <div className="flex flex-col gap-2">
            {message.steps.map((step, index) => {
                return (
                    <div key={index} className="flex animate-[fadeIn_500ms_both] flex-col gap-2">
                        <DocumentView
                            document={step.content}
                            context={{
                                mode: 'default',
                                contentContext: context,
                                wrapBlocksInSuspense: false,
                                shouldRenderLinkPreviews: true,
                            }}
                            style={['space-y-4']}
                        />
                        {renderToolCalls && step.toolCalls && step.toolCalls.length > 0 ? (
                            <AIToolCallsSummary toolCalls={step.toolCalls} context={context} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
