import type { AIMessage } from '@gitbook/api';
import { DocumentView } from '../../DocumentView';
import type { RenderAIMessageOptions } from './types';

/**
 * Render a message from the API backend.
 */
export function AIMessageView(
    props: RenderAIMessageOptions & {
        message: AIMessage;
    }
) {
    const { message } = props;

    return (
        <div className="flex flex-col gap-2">
            {message.steps.map((step, index) => {
                return (
                    <div key={index} className="flex flex-col gap-2">
                        <DocumentView
                            document={step.content}
                            context={{
                                mode: 'default',
                                contentContext: undefined,
                                wrapBlocksInSuspense: false,
                            }}
                            style={['space-y-5']}
                        />
                    </div>
                );
            })}
        </div>
    );
}
